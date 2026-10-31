import { timingSafeEqual } from 'node:crypto';

export type GitHubPermission = 'metadata:read' | 'contents:read' | 'contents:write';
export type GitHubAction = 'read' | 'write';
export type GitHubErrorCode =
  | 'unauthenticated' | 'session_expired' | 'oauth_state_invalid'
  | 'invalid_request' | 'invalid_repository' | 'invalid_path'
  | 'repository_forbidden' | 'installation_revoked' | 'permission_denied'
  | 'stale_revision' | 'approval_required' | 'approval_expired'
  | 'approval_replayed' | 'idempotency_invalid'
  | 'rate_limited' | 'upstream_denied' | 'upstream_unavailable' | 'upstream_failure';

export class GitHubIntegrationError extends Error {
  constructor(readonly code: GitHubErrorCode) {
    super(code);
    this.name = 'GitHubIntegrationError';
  }
}

export type OAuthStateRecord = {
  value: string;
  browserSessionId: string;
  expiresAt: number;
  consumedAt?: number | null;
};

export type GitHubSession = {
  id: string;
  userId: string;
  expiresAt: number;
  revokedAt?: number | null;
};

export type RepositoryGrant = {
  userId: string;
  projectId: string;
  installationId: string;
  owner: string;
  repo: string;
  baseSha: string;
  installationActive: boolean;
  permissions: readonly GitHubPermission[];
};

export type GitHubRequest = {
  projectId: string;
  owner: string;
  repo: string;
  path: string;
  baseSha: string;
  action: GitHubAction;
  idempotencyKey?: string;
};

export type GitTreePathEntry = {
  name: string;
  type: 'tree' | 'blob' | 'commit';
  mode: '040000' | '100644' | '100755' | '120000' | '160000';
  sha: string;
};

export type PinnedPathEvidence = {
  commitSha: string;
  entries: readonly GitTreePathEntry[];
};

export type WriteApproval = {
  id: string;
  userId: string;
  projectId: string;
  owner: string;
  repo: string;
  path: string;
  baseSha: string;
  idempotencyKey: string;
  approvedAt: number;
  expiresAt: number;
  consumedAt?: number | null;
};

export type PinnedBlobRequest = { owner: string; repo: string; path: string; commitSha: string };
export type PinnedBlobResponse = { blobSha: string; content: string; encoding: 'utf-8' };

/** Server-only adapter contract. Implementations receive exact refs and never client-supplied credentials. */
export interface GitHubAppRepositoryAdapter {
  readPinnedBlob(request: PinnedBlobRequest): Promise<PinnedBlobResponse>;
}

export type AuditMetadata = {
  event: 'github.repository.read_authorized' | 'github.repository.write_authorized';
  actorId: string;
  projectId: string;
  installationId: string;
  owner: string;
  repo: string;
  path: string;
  baseSha: string;
  approvalId?: string;
  idempotencyKey?: string;
};

/** Implement with a durable atomic claim before a future remote write can be attempted. */
export interface GitHubWriteAuthorizationStore {
  claim(input: { approvalId: string; idempotencyKey: string; audit: AuditMetadata }): Promise<boolean>;
}

export type AuthorizeGitHubRequest = {
  now: number;
  session: GitHubSession | null;
  grant: RepositoryGrant | null;
  request: GitHubRequest;
  pathEvidence: PinnedPathEvidence;
  approval?: WriteApproval | null;
};

const deny = (code: GitHubErrorCode): never => { throw new GitHubIntegrationError(code); };
const validSha = (sha: unknown): sha is string => typeof sha === 'string' && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(sha);
const validId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(id);
const validIdempotencyKey = (key: unknown): key is string => typeof key === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/.test(key);

export function canonicalRepository(owner: unknown, repo: unknown): { owner: string; repo: string } {
  if (typeof owner !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)
    || typeof repo !== 'string' || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo) || repo === '.' || repo === '..') {
    return deny('invalid_repository');
  }
  return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
}

export function isSafeRepositoryPath(path: unknown): path is string {
  return typeof path === 'string' && path.length <= 1024 && !path.startsWith('/')
    && !/^[A-Za-z]:/.test(path) && !path.includes('\\') && !/[\u0000-\u001f\u007f]/.test(path)
    && path.split('/').every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
}

/** Verify an unexpired, single-use OAuth state bound to the initiating browser session. */
export function validateOAuthState(record: OAuthStateRecord | null, suppliedValue: unknown, browserSessionId: unknown, now: number): void {
  if (!record || typeof record.value !== 'string' || !/^[A-Za-z0-9_-]{43,128}$/.test(record.value)
    || typeof suppliedValue !== 'string' || !validId(browserSessionId)
    || record.browserSessionId !== browserSessionId || !validId(record.browserSessionId)
    || !Number.isFinite(now) || !Number.isFinite(record.expiresAt) || record.expiresAt <= now
    || record.consumedAt != null) {
    return deny('oauth_state_invalid');
  }
  const expected = Buffer.from(record.value);
  const supplied = Buffer.from(suppliedValue);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return deny('oauth_state_invalid');
}

/**
 * Pure policy decision. The server must load grant/path evidence from trusted stores,
 * then atomically consume OAuth state and write approvals/idempotency keys before any remote write.
 */
export function authorizeGitHubRequest(input: AuthorizeGitHubRequest): AuditMetadata {
  const { now, session, grant, request, pathEvidence } = input;
  if (!session || !validId(session.id) || !validId(session.userId)) return deny('unauthenticated');
  if (!Number.isFinite(now) || !Number.isFinite(session.expiresAt) || session.expiresAt <= now || session.revokedAt != null) {
    return deny('session_expired');
  }
  if (!request || !validId(request.projectId) || !isSafeRepositoryPath(request.path)
    || !validSha(request.baseSha) || !['read', 'write'].includes(request.action)) return deny('invalid_request');
  const repo = canonicalRepository(request.owner, request.repo);
  if (!grant || grant.userId !== session.userId || grant.projectId !== request.projectId
    || canonicalRepository(grant.owner, grant.repo).owner !== repo.owner
    || canonicalRepository(grant.owner, grant.repo).repo !== repo.repo || !validId(grant.installationId)) {
    return deny('repository_forbidden');
  }
  if (!grant.installationActive) return deny('installation_revoked');
  if (!validSha(grant.baseSha) || request.baseSha.toLowerCase() !== grant.baseSha.toLowerCase()) return deny('stale_revision');
  if (!pathEvidence || !validSha(pathEvidence.commitSha)
    || pathEvidence.commitSha.toLowerCase() !== request.baseSha.toLowerCase()) return deny('stale_revision');
  const segments = request.path.split('/');
  if (!Array.isArray(pathEvidence.entries) || pathEvidence.entries.length !== segments.length
    || pathEvidence.entries.some((entry, index) => !entry || entry.name !== segments[index] || !validSha(entry.sha)
      || (index < segments.length - 1 ? entry.type !== 'tree' || entry.mode !== '040000'
        : entry.type !== 'blob' || (entry.mode !== '100644' && entry.mode !== '100755')))) return deny('invalid_path');
  const permission = request.action === 'read' ? 'contents:read' : 'contents:write';
  if (!Array.isArray(grant.permissions) || !grant.permissions.includes(permission)) return deny('permission_denied');

  if (request.action === 'write') {
    const approval = input.approval;
    if (!approval) return deny('approval_required');
    if (approval.consumedAt != null) return deny('approval_replayed');
    if (!validIdempotencyKey(request.idempotencyKey) || !validIdempotencyKey(approval.idempotencyKey)) return deny('idempotency_invalid');
    if (!Number.isFinite(approval.approvedAt) || !Number.isFinite(approval.expiresAt)
      || approval.approvedAt > now || approval.expiresAt <= now) return deny('approval_expired');
    if (!validId(approval.id) || approval.userId !== session.userId || approval.projectId !== request.projectId
      || canonicalRepository(approval.owner, approval.repo).owner !== repo.owner
      || canonicalRepository(approval.owner, approval.repo).repo !== repo.repo
      || approval.path !== request.path || !validSha(approval.baseSha)
      || approval.baseSha.toLowerCase() !== request.baseSha.toLowerCase()
      || approval.idempotencyKey !== request.idempotencyKey) return deny('approval_required');
  }

  return {
    event: request.action === 'read' ? 'github.repository.read_authorized' : 'github.repository.write_authorized',
    actorId: session.userId,
    projectId: request.projectId,
    installationId: grant.installationId,
    ...repo,
    path: request.path,
    baseSha: request.baseSha.toLowerCase(),
    ...(input.approval && request.action === 'write' ? {
      approvalId: input.approval.id,
      idempotencyKey: request.idempotencyKey,
    } : {}),
  };
}

/** Map upstream failures to safe typed errors; never forward provider response bodies to clients. */
export function mapGitHubApiFailure(status?: number): GitHubIntegrationError {
  if (status === 429) return new GitHubIntegrationError('rate_limited');
  if (status === 401 || status === 403) return new GitHubIntegrationError('upstream_denied');
  if (status === undefined) return new GitHubIntegrationError('upstream_unavailable');
  return new GitHubIntegrationError('upstream_failure');
}

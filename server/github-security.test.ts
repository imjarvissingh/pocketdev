import { describe, expect, it } from 'vitest';
import {
  authorizeGitHubRequest, canonicalRepository, GitHubIntegrationError, isSafeRepositoryPath,
  mapGitHubApiFailure, validateOAuthState, type AuthorizeGitHubRequest,
} from './github-security';

const now = 10_000;
const sha = 'a'.repeat(40);
const fileSha = 'b'.repeat(40);
const key = 'request-key-00001';
const base: AuthorizeGitHubRequest = {
  now,
  session: { id: 'session_1', userId: 'user_1', expiresAt: now + 60_000 },
  grant: {
    userId: 'user_1', projectId: 'project_1', installationId: 'install_1',
    owner: 'Acme', repo: 'PocketDev', baseSha: sha, installationActive: true,
    permissions: ['metadata:read', 'contents:read'],
  },
  request: { projectId: 'project_1', owner: 'acme', repo: 'pocketdev', path: 'src/main.ts', baseSha: sha, action: 'read' },
  pathEvidence: { commitSha: sha, entries: [
    { name: 'src', type: 'tree', mode: '040000', sha: fileSha },
    { name: 'main.ts', type: 'blob', mode: '100644', sha: fileSha },
  ] },
};

function expectCode(run: () => unknown, code: string) {
  try { run(); throw new Error('Expected authorization to reject.'); }
  catch (error) {
    expect(error).toBeInstanceOf(GitHubIntegrationError);
    expect((error as GitHubIntegrationError).code).toBe(code);
  }
}

function writeInput(overrides: Partial<AuthorizeGitHubRequest> = {}): AuthorizeGitHubRequest {
  return {
    ...base,
    ...overrides,
    request: { ...base.request, action: 'write', idempotencyKey: key, ...(overrides.request ?? {}) },
    grant: { ...base.grant!, permissions: ['contents:write'], ...(overrides.grant ?? {}) },
    approval: {
      id: 'approval_1', userId: 'user_1', projectId: 'project_1', owner: 'ACME', repo: 'PocketDev',
      path: 'src/main.ts', baseSha: sha, idempotencyKey: key, approvedAt: now - 100, expiresAt: now + 60_000,
      ...(overrides.approval ?? {}),
    },
  };
}

describe('GitHub integration security contracts', () => {
  it('normalizes selected repository identifiers and returns minimal read audit metadata', () => {
    expect(canonicalRepository('Acme', 'PocketDev')).toEqual({ owner: 'acme', repo: 'pocketdev' });
    expect(authorizeGitHubRequest(base)).toEqual({
      event: 'github.repository.read_authorized', actorId: 'user_1', projectId: 'project_1',
      installationId: 'install_1', owner: 'acme', repo: 'pocketdev', path: 'src/main.ts', baseSha: sha,
    });
  });

  it('denies missing grants, other users, and cross-project access', () => {
    expectCode(() => authorizeGitHubRequest({ ...base, grant: null }), 'repository_forbidden');
    expectCode(() => authorizeGitHubRequest({ ...base, session: { ...base.session!, userId: 'user_2' } }), 'repository_forbidden');
    expectCode(() => authorizeGitHubRequest({ ...base, request: { ...base.request, projectId: 'project_2' } }), 'repository_forbidden');
  });

  it('rejects expired or revoked sessions and invalid OAuth state', () => {
    expectCode(() => authorizeGitHubRequest({ ...base, session: { ...base.session!, expiresAt: now } }), 'session_expired');
    expectCode(() => authorizeGitHubRequest({ ...base, session: { ...base.session!, revokedAt: now - 1 } }), 'session_expired');
    const state = 's'.repeat(43);
    const record = { value: state, browserSessionId: 'browser_1', expiresAt: now + 100 };
    expect(() => validateOAuthState(record, state, 'browser_1', now)).not.toThrow();
    expectCode(() => validateOAuthState(record, 'x'.repeat(43), 'browser_1', now), 'oauth_state_invalid');
    expectCode(() => validateOAuthState(record, state, 'browser_2', now), 'oauth_state_invalid');
    expectCode(() => validateOAuthState({ ...record, expiresAt: now }, state, 'browser_1', now), 'oauth_state_invalid');
    expectCode(() => validateOAuthState({ ...record, consumedAt: now - 1 }, state, 'browser_1', now), 'oauth_state_invalid');
  });

  it('requires an active installation and exact read/write permissions', () => {
    expectCode(() => authorizeGitHubRequest({ ...base, grant: { ...base.grant!, installationActive: false } }), 'installation_revoked');
    expectCode(() => authorizeGitHubRequest({ ...base, grant: { ...base.grant!, permissions: ['metadata:read'] } }), 'permission_denied');
    expectCode(() => authorizeGitHubRequest({ ...writeInput(), grant: { ...writeInput().grant!, permissions: ['contents:read'] } }), 'permission_denied');
  });

  it('requires canonical relative paths resolved through real directories and regular files', () => {
    expect(isSafeRepositoryPath('src/é.ts')).toBe(true);
    for (const path of ['', '/etc/passwd', '../secret', 'src/../secret', 'C:/secret', 'src\\secret', 'src//file', 'src/\0file']) {
      expect(isSafeRepositoryPath(path)).toBe(false);
    }
    expectCode(() => authorizeGitHubRequest({ ...base, request: { ...base.request, path: '../secret' } }), 'invalid_request');
    const symlink = { ...base.pathEvidence, entries: [
      { name: 'src', type: 'blob' as const, mode: '120000' as const, sha: fileSha },
      { name: 'main.ts', type: 'blob' as const, mode: '100644' as const, sha: fileSha },
    ] };
    expectCode(() => authorizeGitHubRequest({ ...base, pathEvidence: symlink }), 'invalid_path');
    const leafSymlink = { ...base.pathEvidence, entries: [
      base.pathEvidence.entries[0]!,
      { name: 'main.ts', type: 'blob' as const, mode: '120000' as const, sha: fileSha },
    ] };
    expectCode(() => authorizeGitHubRequest({ ...base, pathEvidence: leafSymlink }), 'invalid_path');
  });

  it('rejects stale request revisions and stale tree evidence', () => {
    expectCode(() => authorizeGitHubRequest({ ...base, request: { ...base.request, baseSha: 'c'.repeat(40) } }), 'stale_revision');
    expectCode(() => authorizeGitHubRequest({ ...base, pathEvidence: { ...base.pathEvidence, commitSha: 'c'.repeat(40) } }), 'stale_revision');
  });

  it('requires approval scoped to the exact write and prevents reused approvals', () => {
    const noApproval = writeInput(); delete noApproval.approval;
    expectCode(() => authorizeGitHubRequest(noApproval), 'approval_required');
    expect(authorizeGitHubRequest(writeInput()).event).toBe('github.repository.write_authorized');
    expectCode(() => authorizeGitHubRequest(writeInput({ approval: { ...writeInput().approval!, consumedAt: now } })), 'approval_replayed');
    expectCode(() => authorizeGitHubRequest(writeInput({ approval: { ...writeInput().approval!, expiresAt: now } })), 'approval_expired');
    expectCode(() => authorizeGitHubRequest(writeInput({ approval: { ...writeInput().approval!, path: 'src/other.ts' } })), 'approval_required');
    expectCode(() => authorizeGitHubRequest(writeInput({ request: { ...writeInput().request, idempotencyKey: 'different-key-001' } })), 'approval_required');
    expectCode(() => authorizeGitHubRequest(writeInput({ request: { ...writeInput().request, idempotencyKey: 'short' } })), 'idempotency_invalid');
  });

  it('maps provider and network failures without exposing response content', () => {
    expect(mapGitHubApiFailure(429).code).toBe('rate_limited');
    expect(mapGitHubApiFailure(403).code).toBe('upstream_denied');
    expect(mapGitHubApiFailure().code).toBe('upstream_unavailable');
    expect(mapGitHubApiFailure(503).code).toBe('upstream_failure');
  });
});

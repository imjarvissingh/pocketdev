import { exportUnifiedPatch } from './drafts';

/**
 * Recompute the Git blob object SHA-1 for the exact bytes delivered by GitHub.
 * This is an immutable-revision consistency check, NOT a security audit or code test.
 */
export async function gitBlobSha1(text: string): Promise<string> {
  const body = new TextEncoder().encode(text);
  const header = new TextEncoder().encode('blob ' + body.byteLength + '\0');
  const bytes = new Uint8Array(header.length + body.length);
  bytes.set(header); bytes.set(body, header.length);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

export type PatchCheck = {
  patch: string;
  blobVerified: boolean;
  baseSha: string;
  byteLength: number;
  linesAdded: number;
  linesRemoved: number;
  note: string;
};

export async function checkDraftPatch(path: string, baseText: string, draftText: string, expectedBlobSha: string): Promise<PatchCheck> {
  if (!/^[0-9a-f]{40}$/.test(expectedBlobSha)) throw new Error('Unsupported Git blob identifier.');
  const actual = await gitBlobSha1(baseText);
  if (actual !== expectedBlobSha) throw new Error('Git blob mismatch: loaded source does not match the selected revision. Export blocked.');
  const patch = exportUnifiedPatch(path, baseText, draftText);
  const lines = patch.split('\n');
  return {
    patch,
    blobVerified: true,
    baseSha: expectedBlobSha,
    byteLength: new TextEncoder().encode(patch).length,
    linesAdded: lines.filter(line => line.startsWith('+') && !line.startsWith('+++')).length,
    linesRemoved: lines.filter(line => line.startsWith('-') && !line.startsWith('---')).length,
    note: 'Source blob checksum verified only. Patch application, tests, GitHub authorization and merge conflict checks are NOT verified in this browser.',
  };
}

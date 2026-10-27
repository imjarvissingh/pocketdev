import { describe, expect, it, vi } from 'vitest';
import { checkDraftPatch, gitBlobSha1 } from './verification';
import { createHash, webcrypto } from 'node:crypto';
vi.stubGlobal('crypto', webcrypto);
const digest = (text: string) => {
  const payload = Buffer.from(text, 'utf8');
  return createHash('sha1').update(Buffer.from('blob ' + payload.length + '\0')).update(payload).digest('hex');
};
describe('git blob revision checks', () => {
  it('computes exact Git blob SHA for UTF8 text', async () => {
    expect(await gitBlobSha1('hello\n')).toBe(digest('hello\n'));
    expect(await gitBlobSha1('🌎\n')).toBe(digest('🌎\n'));
  });
  it('allows a verified draft patch only for matching original bytes', async () => {
    const result = await checkDraftPatch('README.md', 'hello\n', 'hello world\n', digest('hello\n'));
    expect(result.blobVerified).toBe(true);
    expect(result.patch).toContain('+hello world');
    expect(result.note).toContain('NOT verified');
  });
  it('fails closed if source differs from selected Git blob', async () => {
    await expect(checkDraftPatch('README.md', 'tampered', 'new', digest('hello\n'))).rejects.toThrow('mismatch');
  });
  it('refuses unchanged drafts and non-SHA-1 identifiers', async () => {
    await expect(checkDraftPatch('README.md','a','a',digest('a'))).rejects.toThrow('no changes');
    await expect(checkDraftPatch('README.md','a','b','x'.repeat(40))).rejects.toThrow('Unsupported');
  });
});

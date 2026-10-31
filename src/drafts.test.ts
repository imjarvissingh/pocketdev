import { describe, expect, it } from 'vitest';
import { draftStorageKey, exportUnifiedPatch, getLocalDraft, MAX_DRAFT_BYTES, removeLocalDraft, saveLocalDraft } from './drafts';
const key = { owner: 'org', repo: 'repo', commitSha: 'a'.repeat(40), path: 'src/a.txt', blobSha: 'b'.repeat(40) };
const storage = () => {
  const values = new Map<string,string>();
  return { getItem: (k:string) => values.get(k) ?? null, setItem: (k:string,v:string) => {values.set(k,v)}, removeItem:(k:string)=>{values.delete(k)} };
};
describe('local drafts', () => {
  it('scopes every draft by repo and immutable revision', () => {
    const s=storage();saveLocalDraft(key,'edited',s);
    expect(getLocalDraft(key,s)).toBe('edited');
    expect(getLocalDraft({...key,commitSha:'c'.repeat(40)},s)).toBeNull();
    expect(draftStorageKey(key)).toContain('src/a.txt');
    removeLocalDraft(key,s);expect(getLocalDraft(key,s)).toBeNull();
  });
  it('limits UTF8 byte size and ignores malformed stored data', () => {
    const s=storage();
    expect(() => saveLocalDraft(key,'€'.repeat(MAX_DRAFT_BYTES),s)).toThrow('100 KB');
    s.setItem(draftStorageKey(key),'not json');
    expect(getLocalDraft(key,s)).toBeNull();
  });
});
describe('unified diff export', () => {
  it('produces valid whole-file change hunk', () => {
    const patch = exportUnifiedPatch('src/a.txt','a\nb\n','a\nc\n');
    expect(patch).toContain('@@ -1,2 +1,2 @@');
    expect(patch).toContain('-b\n');
    expect(patch).toContain('+c\n');
  });
  it('supports missing final newlines and empty originals', () => {
    const patch=exportUnifiedPatch('a.txt','','hi');
    expect(patch).toContain('@@ -0,0 +1,1 @@');
    expect(patch).toContain('\\ No newline at end of file');
  });
  it('limits the hunk to three context lines and notices final-newline changes', () => {
    const patch = exportUnifiedPatch('a.txt', 'one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\n', 'one\ntwo\nthree\nfour\nFIVE\nsix\nseven\neight\n');
    expect(patch).toContain('@@ -2,7 +2,7 @@');
    expect(patch).not.toContain(' one\n');
    expect(exportUnifiedPatch('a.txt', 'same', 'same\n')).toContain('\\ No newline at end of file');
  });
  it('refuses unchanged content and unsafe paths', () => {
    expect(()=>exportUnifiedPatch('src/a.txt','a','a')).toThrow('no changes');
    expect(()=>exportUnifiedPatch('../secret','a','b')).toThrow('Invalid');
    expect(()=>exportUnifiedPatch('/etc/passwd','a','b')).toThrow('Invalid');
    expect(()=>exportUnifiedPatch('..\\secret','a','b')).toThrow('Invalid');
    expect(()=>exportUnifiedPatch('C:/Windows/file','a','b')).toThrow('Invalid');
    expect(()=>exportUnifiedPatch('src/\u0000file','a','b')).toThrow('Invalid');
  });
});

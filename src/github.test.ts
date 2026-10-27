import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicFile, fetchPublicTree, parsePublicRepo } from './github';
const SHA = 'a'.repeat(40);
describe('public repository input', () => {
  it('accepts owner/repo and GitHub URLs', () => {
    expect(parsePublicRepo('imjarvissingh/pocketdev')).toEqual({ owner: 'imjarvissingh', repo: 'pocketdev' });
    expect(parsePublicRepo('https://github.com/imjarvissingh/pocketdev')).toEqual({ owner: 'imjarvissingh', repo: 'pocketdev' });
  });
  it('rejects other hosts and nested paths, query strings or invalid names', () => {
    for (const x of ['https://github.com.evil.test/a/b', 'https://github.com/a/b/tree/main', '../repo', 'https://github.com/a/b?token=secret', 'a']) {
      expect(() => parsePublicRepo(x)).toThrow();
    }
  });
});
describe('public GitHub reads', () => {
  beforeEach(() => vi.unstubAllGlobals());
  it('pins tree access to the returned commit and excludes unsupported entries', async () => {
    const mock = vi.fn().mockResolvedValueOnce({ ok:true,json:async()=>({default_branch:'main',private:false}) })
      .mockResolvedValueOnce({ ok:true,json:async()=>({sha:SHA}) })
      .mockResolvedValueOnce({ ok:true,json:async()=>({truncated:false,tree:[{path:'README.md',type:'blob',sha:SHA,size:6},{path:'link',type:'commit',sha:SHA}]}) });
    vi.stubGlobal('fetch', mock);
    const tree = await fetchPublicTree({owner:'imjarvissingh',repo:'pocketdev'});
    expect(tree.commitSha).toBe(SHA);
    expect(tree.entries).toHaveLength(1);
    expect(mock.mock.calls[2][0]).toContain('/git/trees/' + SHA);
    expect(mock.mock.calls[0][1].credentials).toBe('omit');
  });
  it('blocks oversized files before contacting GitHub', async () => {
    const mock = vi.fn();vi.stubGlobal('fetch',mock);
    await expect(fetchPublicFile({owner:'a',repo:'b'}, {path:'huge',type:'blob',sha:SHA,size:100_001})).rejects.toThrow('too large');
    expect(mock).not.toHaveBeenCalled();
  });
  it('decodes text files and rejects binary file responses', async () => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({encoding:'base64',content:'SGVsbG8h',size:6})}));
    await expect(fetchPublicFile({owner:'a',repo:'b'},{path:'a.txt',type:'blob',sha:SHA,size:6})).resolves.toBe('Hello!');
  });
  it('describes rate limiting instead of retrying automatically', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:false,status:429}));
    await expect(fetchPublicTree({owner:'a',repo:'b'})).rejects.toThrow('rate-limited');
  });
});

/** Read-only public GitHub preview. Never send credentials, mutate repositories, or persist remote file contents. */
export type PublicRepo = { owner: string; repo: string };
export type GitEntry = { path: string; type: 'blob' | 'tree'; sha: string; size?: number };
export type RepoSnapshot = { repo: PublicRepo; commitSha: string; entries: GitEntry[]; truncated: boolean };
const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
const MAX_TREE = 2000;
export const MAX_FILE_BYTES = 100_000;

export function parsePublicRepo(input: string): PublicRepo {
  const value = input.trim();
  let text = value;
  if (value.startsWith('https://')) {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== 'github.com' || url.search || url.hash ||
        (url.pathname.split('/').filter(Boolean).length !== 2)) throw new Error('Enter a GitHub repository URL such as https://github.com/owner/repo.');
    text = url.pathname.slice(1);
  }
  const match = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38}))\/([a-zA-Z0-9_.-]{1,100})(?:\.git)?$/.exec(text);
  if (!match || match[2] === '.' || match[2] === '..') throw new Error('Enter an owner/repository pair or GitHub repository URL.');
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

function errorFromResponse(status: number): Error {
  if (status === 404) return new Error('Public repository or file not found. Private repositories are not supported.');
  if (status === 403 || status === 429) return new Error('GitHub request blocked or rate-limited. Try again later.');
  return new Error('GitHub returned HTTP ' + status + '.');
}
async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { headers, signal, credentials: 'omit', cache: 'no-store' });
  if (!response.ok) throw errorFromResponse(response.status);
  return await response.json() as T;
}
export async function fetchPublicTree(repo: PublicRepo, signal?: AbortSignal): Promise<RepoSnapshot> {
  const root = 'https://api.github.com/repos/' + encodeURIComponent(repo.owner) + '/' + encodeURIComponent(repo.repo);
  const metadata = await getJson<{default_branch: string; private: boolean}>(root, signal);
  if (metadata.private) throw new Error('Private repositories are not supported in read-only preview.');
  const commit = await getJson<{sha: string}>(root + '/commits/' + encodeURIComponent(metadata.default_branch), signal);
  if (!/^[a-f0-9]{40,64}$/.test(commit.sha)) throw new Error('Invalid revision returned by GitHub.');
  const tree = await getJson<{truncated: boolean; tree: GitEntry[]}>(root + '/git/trees/' + commit.sha + '?recursive=1', signal);
  const entries = tree.tree.filter(entry => (entry.type === 'blob' || entry.type === 'tree')
    && typeof entry.path === 'string' && typeof entry.sha === 'string'
    && /^[a-f0-9]{40,64}$/.test(entry.sha)).slice(0, MAX_TREE);
  return { repo, commitSha: commit.sha, entries, truncated: !!tree.truncated || tree.tree.length > MAX_TREE };
}
export async function fetchPublicFile(repo: PublicRepo, entry: GitEntry, signal?: AbortSignal): Promise<string> {
  if (entry.type !== 'blob') throw new Error('Select a file, not a directory.');
  if (typeof entry.size !== 'number' || entry.size > MAX_FILE_BYTES || entry.size < 0) throw new Error('File too large or file size unknown. Limit: 100 KB.');
  if (!/^[a-f0-9]{40,64}$/.test(entry.sha)) throw new Error('Invalid Git blob ID.');
  const root = 'https://api.github.com/repos/' + encodeURIComponent(repo.owner) + '/' + encodeURIComponent(repo.repo);
  const blob = await getJson<{content: string; encoding: string; size: number}>(root + '/git/blobs/' + entry.sha, signal);
  if (blob.encoding !== 'base64' || !Number.isFinite(blob.size) || blob.size > MAX_FILE_BYTES) throw new Error('Unsupported file encoding or size.');
  const binary = atob(blob.content.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  if (bytes.includes(0)) throw new Error('Binary file preview is not supported.');
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

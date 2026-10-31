/** Browser-only demonstration drafts. Never store credentials or confidential source here. */
export type DraftKey = { owner: string; repo: string; commitSha: string; path: string; blobSha: string };
export const MAX_DRAFT_BYTES = 100_000;
const prefix = 'pocketdev:local-draft:v1:';
function utf8Bytes(text: string): number { return new TextEncoder().encode(text).length; }

export function draftStorageKey(key: DraftKey): string {
  return prefix + JSON.stringify([key.owner, key.repo, key.commitSha, key.path, key.blobSha]);
}
export function getLocalDraft(key: DraftKey, storage: Pick<Storage, 'getItem'>): string | null {
  try {
    const raw = storage.getItem(draftStorageKey(key));
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'string' || utf8Bytes(value) > MAX_DRAFT_BYTES) return null;
    return value;
  } catch { return null; }
}
export function saveLocalDraft(key: DraftKey, text: string, storage: Pick<Storage, 'setItem'>): void {
  if (utf8Bytes(text) > MAX_DRAFT_BYTES) throw new Error('Draft exceeds the 100 KB browser limit.');
  storage.setItem(draftStorageKey(key), JSON.stringify(text));
}
export function removeLocalDraft(key: DraftKey, storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(draftStorageKey(key));
}

/** Small-file unified patch with up to three context lines around the changed region. */
export function exportUnifiedPatch(path: string, original: string, updated: string): string {
  if (!path || path.startsWith('/') || /^[a-zA-Z]:/.test(path) || path.includes('\\')
    || path.split('/').some(s => s === '.' || s === '..' || !s)
    || /[\u0000-\u001f\u007f]/.test(path)) throw new Error('Invalid repository file path.');
  if (original === updated) throw new Error('There are no changes to export.');
  if (utf8Bytes(original) > MAX_DRAFT_BYTES || utf8Bytes(updated) > MAX_DRAFT_BYTES) throw new Error('File exceeds the 100 KB patch limit.');
  const split = (text: string) => {
    if (!text) return [];
    const lines = text.split('\n');
    if (text.endsWith('\n')) lines.pop();
    return lines.map((value, index) => ({ value, terminated: index < lines.length - 1 || text.endsWith('\n') }));
  };
  const oldLines = split(original), newLines = split(updated);
  const same = (a: typeof oldLines[number], b: typeof newLines[number]) =>
    a.value === b.value && a.terminated === b.terminated;
  let prefix = 0;
  while (prefix < oldLines.length && prefix < newLines.length && same(oldLines[prefix]!, newLines[prefix]!)) prefix++;
  let suffix = 0;
  while (suffix < oldLines.length - prefix && suffix < newLines.length - prefix
    && same(oldLines[oldLines.length - suffix - 1]!, newLines[newLines.length - suffix - 1]!)) suffix++;

  const context = 3;
  const start = Math.max(0, prefix - context);
  const oldEnd = oldLines.length - suffix;
  const newEnd = newLines.length - suffix;
  const after = Math.min(context, suffix);
  const oldBlock = oldLines.slice(start, oldEnd + after);
  const newBlock = newLines.slice(start, newEnd + after);
  const range = (line: number, count: number) => `${count ? line + 1 : line},${count}`;
  const render = (lines: typeof oldLines, symbol: string) => lines.map(line =>
    symbol + line.value + '\n' + (line.terminated ? '' : '\\ No newline at end of file\n')).join('');
  const hunk = `@@ -${range(start, oldBlock.length)} +${range(start, newBlock.length)} @@\n`;
  // shortcut: separated edits share one hunk, split hunks if distant changes make patches too large.
  return '--- a/' + path + '\n+++ b/' + path + '\n' + hunk
    + render(oldLines.slice(start, prefix), ' ')
    + render(oldLines.slice(prefix, oldEnd), '-')
    + render(newLines.slice(prefix, newEnd), '+')
    + render(oldLines.slice(oldEnd, oldEnd + after), ' ');
}
export function downloadPatch(path: string, patch: string): void {
  const blob = new Blob([patch], { type: 'text/x-diff;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = path.split('/').at(-1)!.replace(/[^a-zA-Z0-9_.-]/g, '_') + '.patch';
  anchor.click();
  URL.revokeObjectURL(href);
}

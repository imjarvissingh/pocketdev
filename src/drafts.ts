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

/** Basic unified patch. Whole-file hunk is intentional for this small-file prototype. */
export function exportUnifiedPatch(path: string, original: string, updated: string): string {
  if (!path || path.startsWith('/') || /^[a-zA-Z]:/.test(path) || path.includes('\\')
    || path.split('/').some(s => s === '.' || s === '..' || !s)
    || /[\u0000-\u001f\u007f]/.test(path)) throw new Error('Invalid repository file path.');
  if (original === updated) throw new Error('There are no changes to export.');
  if (utf8Bytes(original) > MAX_DRAFT_BYTES || utf8Bytes(updated) > MAX_DRAFT_BYTES) throw new Error('File exceeds the 100 KB patch limit.');
  const split = (s: string) => s.length === 0 ? [] : (s.endsWith('\n') ? s.slice(0, -1) : s).split('\n');
  const oldLines = split(original), newLines = split(updated);
  const lineBlock = (lines: string[], symbol: string, terminated: boolean) =>
    lines.map((line, i) => symbol + line + '\n' + (i === lines.length - 1 && !terminated ? '\\ No newline at end of file\n' : '')).join('');
  const hunk = '@@ -' + (oldLines.length ? '1,' + oldLines.length : '0,0') + ' +' +
    (newLines.length ? '1,' + newLines.length : '0,0') + ' @@\n';
  return '--- a/' + path + '\n+++ b/' + path + '\n' + hunk +
    lineBlock(oldLines, '-', original.endsWith('\n')) +
    lineBlock(newLines, '+', updated.endsWith('\n'));
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

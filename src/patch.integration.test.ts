import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { exportUnifiedPatch } from './drafts';

function withTempDir(fn: (directory: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'pocketdev-patch-'));
  try { fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}
describe('actual git apply integration (isolated fixture only)', () => {
  it('checks and applies a patch to a matching source fixture', () => withTempDir(dir => {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'demo.txt'), 'before\nsecond\n');
    const patch = exportUnifiedPatch('src/demo.txt', 'before\nsecond\n', 'after\nsecond\n');
    const patchFile = join(dir, 'demo.patch');
    writeFileSync(patchFile, patch);
    execFileSync('git', ['apply', '--check', patchFile], { cwd: dir });
    execFileSync('git', ['apply', patchFile], { cwd: dir });
    expect(readFileSync(join(dir, 'src', 'demo.txt'), 'utf8')).toBe('after\nsecond\n');
  }));
  it('rejects a stale or diverged base using git apply --check', () => withTempDir(dir => {
    writeFileSync(join(dir, 'demo.txt'), 'someone else modified this\n');
    const patch = exportUnifiedPatch('demo.txt', 'before\n', 'after\n');
    const patchFile = join(dir, 'demo.patch');
    writeFileSync(patchFile, patch);
    const result = spawnSync('git', ['apply', '--check', patchFile], { cwd: dir });
    expect(result.status).not.toBe(0);
    expect(readFileSync(join(dir, 'demo.txt'), 'utf8')).toBe('someone else modified this\n');
  }));
  it('applies a missing-final-newline patch without corrupting content', () => withTempDir(dir => {
    writeFileSync(join(dir, 'demo.txt'), 'before');
    const patchFile = join(dir, 'demo.patch');
    writeFileSync(patchFile, exportUnifiedPatch('demo.txt', 'before', 'after'));
    execFileSync('git', ['apply', '--check', patchFile], { cwd: dir });
    execFileSync('git', ['apply', patchFile], { cwd: dir });
    expect(readFileSync(join(dir, 'demo.txt'), 'utf8')).toBe('after');
  }));
  it('checks and applies a CRLF patch containing Unicode without changing line endings', () => withTempDir(dir => {
    const original = 'const label = "café";\r\nkeep this line\r\n';
    const updated = 'const label = "🌍";\r\nkeep this line\r\n';
    writeFileSync(join(dir, 'demo.ts'), original);
    const patchFile = join(dir, 'demo.patch');
    writeFileSync(patchFile, exportUnifiedPatch('demo.ts', original, updated));
    execFileSync('git', ['apply', '--check', patchFile], { cwd: dir });
    execFileSync('git', ['apply', patchFile], { cwd: dir });
    expect(readFileSync(join(dir, 'demo.ts'), 'utf8')).toBe(updated);
  }));
});

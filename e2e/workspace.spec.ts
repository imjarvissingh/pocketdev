import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const source = 'const greeting = "café";\n';
const commit = 'a'.repeat(40);
const blobSha = createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
const encoded = Buffer.from(source).toString('base64');
const secondSource = 'export const count = 1;\n';
const secondSha = createHash('sha1').update(`blob ${Buffer.byteLength(secondSource)}\0`).update(secondSource).digest('hex');
const emptySha = createHash('sha1').update('blob 0\0').digest('hex');

async function mockRepository(page: Page, status = 200) {
  await page.route('https://api.github.com/**', async route => {
    const url = new URL(route.request().url());
    if (status !== 200) {
      await route.fulfill({ status, headers: { 'x-ratelimit-remaining': '0' }, json: { message: 'API rate limit exceeded' } });
    } else if (url.pathname.endsWith('/repos/acme/demo')) {
      await route.fulfill({ json: { default_branch: 'main', private: false } });
    } else if (url.pathname.endsWith('/commits/main')) {
      await route.fulfill({ json: { sha: commit } });
    } else if (url.pathname.endsWith(`/git/trees/${commit}`)) {
      await route.fulfill({ json: { truncated: false, tree: [
        { type: 'blob', path: 'src/main.ts', sha: blobSha, size: Buffer.byteLength(source) },
        { type: 'blob', path: 'src/other.ts', sha: secondSha, size: Buffer.byteLength(secondSource) },
        { type: 'blob', path: 'src/empty.ts', sha: emptySha, size: 0 },
        { type: 'blob', path: 'large.txt', sha: 'b'.repeat(40), size: 102401 },
      ] } });
    } else if (url.pathname.endsWith(`/git/blobs/${blobSha}`)) {
      await route.fulfill({ json: { encoding: 'base64', size: Buffer.byteLength(source), content: encoded } });
    } else if (url.pathname.endsWith(`/git/blobs/${secondSha}`)) {
      await route.fulfill({ json: { encoding: 'base64', size: Buffer.byteLength(secondSource), content: Buffer.from(secondSource).toString('base64') } });
    } else if (url.pathname.endsWith(`/git/blobs/${emptySha}`)) {
      await route.fulfill({ json: { encoding: 'base64', size: 0, content: '' } });
    } else {
      await route.fulfill({ status: 404, json: { message: 'Not Found' } });
    }
  });
}

async function openCode(page: Page) {
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await page.getByLabel('Public repository (owner/repo)').fill('acme/demo');
  await page.getByRole('button', { name: 'Load repository' }).click();
}

test('projects and workers persist and stay scoped to their project', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Project name').fill('Pocket Alpha');
  await page.getByRole('button', { name: /Create project/ }).click();
  await page.getByLabel('Worker name').fill('Alpha coder');
  await page.getByRole('button', { name: /Add worker/ }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.getByLabel('Project name').fill('Pocket Beta');
  await page.getByRole('button', { name: /Create project/ }).click();
  await page.getByLabel('Worker name').fill('Beta reviewer');
  await page.getByLabel('Worker role').selectOption('Reviewer');
  await page.getByRole('button', { name: /Add worker/ }).click();
  await page.getByLabel('Active project').selectOption({ label: 'Pocket Alpha' });
  await expect(page.getByText('Alpha coder')).toBeVisible();
  await expect(page.getByText('Beta reviewer')).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Active project').locator('option:checked')).toHaveText('Pocket Alpha');
  await page.getByRole('button', { name: 'Workers', exact: true }).click();
  await expect(page.getByText('Alpha coder')).toBeVisible();
});

test('pinned source draft saves, restores, discards and exports while guarding unsaved navigation', async ({ page }) => {
  await mockRepository(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await openCode(page);
  await expect(page.getByText(`Pinned commit: ${commit.slice(0, 12)}`)).toBeVisible();
  await page.getByRole('button', { name: /src\/main.ts/ }).click();
  const editor = page.getByRole('textbox', { name: 'Local code draft' });
  await expect(editor).toHaveValue(source);
  await editor.fill('const greeting = "hello 🌎";\n');
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: /src\/other.ts/ }).click();
  await expect(editor).toHaveValue('const greeting = "hello 🌎";\n');
  await page.getByRole('button', { name: 'Save local draft' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved only in this browser' })).toBeVisible();
  await page.reload();
  await openCode(page);
  await page.getByRole('button', { name: /src\/main.ts/ }).click();
  await expect(editor).toHaveValue('const greeting = "hello 🌎";\n');
  await expect(page.getByRole('status').filter({ hasText: 'restored for this exact commit' })).toBeVisible();
  await page.getByRole('button', { name: 'Discard draft' }).click();
  await expect(editor).toHaveValue(source);
  await editor.fill('const greeting = "patch me";\n');
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(editor).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Verify source & export .patch' }).click();
  const saved = await download;
  const patch = await readFile(await saved.path(), 'utf8');
  expect(patch).toContain('--- a/src/main.ts');
  expect(patch).toContain('+const greeting = "patch me";');
  await expect(page.getByRole('status').filter({ hasText: 'Patch application, tests, GitHub authorization' })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /src\/empty.ts/ }).click();
  await expect(editor).toHaveValue('');
  await editor.fill('🌱\n');
  const emptyPatchDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Verify source & export .patch' }).click();
  const emptyPatch = await readFile(await (await emptyPatchDownload).path(), 'utf8');
  expect(emptyPatch).toContain('@@ -0,0 +1,1 @@');
  expect(emptyPatch).toContain('+🌱');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('rate limits and oversized files are reported without an editable source', async ({ page }) => {
  await mockRepository(page, 403);
  await page.goto('/');
  await openCode(page);
  await expect(page.getByRole('alert')).toContainText('rate-limited');
  await mockRepository(page);
  await page.getByRole('button', { name: 'Load repository' }).click();
  await page.getByRole('button', { name: 'large.txt' }).click();
  await expect(page.getByText('File not available for editing.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Local code draft' })).toHaveCount(0);
});

test('GitHub server failures are surfaced to the user', async ({ page }) => {
  await mockRepository(page, 500);
  await page.goto('/');
  await openCode(page);
  await expect(page.getByRole('alert')).toContainText('HTTP 500');
});

for (const width of [360, 390]) {
  test(`mobile project controls remain visible without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Create project/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Projects', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });
}

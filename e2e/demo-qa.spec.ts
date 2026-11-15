import { expect, test, type Page } from '@playwright/test';
const key = 'lighthouse-narrative-slice-save-v4';
const read = (p: Page) => p.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
async function resume(p: Page) {
  await p.reload();
  await p.getByRole('button', { name: 'Continue', exact: true }).click();
}
async function begin(p: Page) {
  await p.goto('/');
  await p.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(p.getByRole('region', { name: 'Cycle offers' })).toBeVisible();
}
async function tutorial(p: Page) {
  await begin(p);
  await p.locator('.board-card').click();
  await p.getByRole('button', { name: /Confirm assignment/ }).click();
  await expect(p.locator('.dock .choice').first()).toBeVisible();
}

test('reload matrix: hub, preparation, choice, staged and accepted outcome', async ({ page }) => {
  await begin(page);
  const hub = await read(page);
  await resume(page);
  expect(await read(page)).toEqual(hub);
  await page.locator('.board-card').click();
  await expect(page.locator('.prepare')).toBeVisible();
  const prepare = await read(page);
  await resume(page);
  await expect(page.locator('.prepare')).toBeVisible();
  expect(await read(page)).toEqual(prepare);
  await page.getByRole('button', { name: /Confirm assignment/ }).click();
  await expect(page.locator('.dock .choice').first()).toBeVisible();
  const choice = await read(page);
  await resume(page);
  expect(await read(page)).toEqual(choice);
  await page.locator('.dock .choice').first().click();
  await expect(page.getByRole('button', { name: 'Try it', exact: true })).toBeVisible();
  await resume(page);
  await expect(page.locator('.dock .choice').first()).toBeVisible();
  expect(await read(page)).toEqual(choice); // Uncommitted staged approach deliberately restores its choice.
  await page.locator('.dock .choice').first().click();
  await page.getByRole('button', { name: 'Try it', exact: true }).click();
  await page.getByRole('button', { name: 'Accept the result', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Cycle offers' })).toBeVisible();
  const accepted = await read(page);
  await resume(page);
  expect(await read(page)).toEqual(accepted);
  expect(accepted.run.played.filter((e: { id: string }) => e.id === 'written_clause')).toHaveLength(1);
});

test('corrupt current save falls back to v3 and migrates only on Continue', async ({ page }) => {
  await begin(page);
  const original = await read(page);
  await page.evaluate(
    ({ key, original }) => {
      const legacy = structuredClone(original);
      legacy.v = 3;
      delete legacy.run.ending;
      delete legacy.run.cycle.arrears;
      delete legacy.run.cycle.upkeepShortfall;
      delete legacy.run.cycle.failed;
      localStorage.setItem(key.replace('v4', 'v3'), JSON.stringify(legacy));
      localStorage.setItem(key, '{broken');
    },
    { key, original },
  );
  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe('{broken');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(() => read(page)).toEqual(original);
  expect(await page.evaluate(k => localStorage.getItem(k.replace('v4', 'v3')), key)).toBeNull();
});

test('known gap #185: an unresolved roll must resume its result, not rewind', async ({ page }) => {
  await tutorial(page);
  await page.locator('.dock .choice').first().click();
  await page.getByRole('button', { name: 'Try it', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Accept the result', exact: true })).toBeVisible();
  await resume(page);
  test.fail(true, 'Known #185: pending roll is not persisted; remove expected failure when fixed.');
  await expect(page.getByRole('button', { name: 'Accept the result', exact: true })).toBeVisible();
});

for (const colorScheme of ['dark', 'light'] as const) {
  test(`mobile ${colorScheme}: 320px, enlarged text, controls and modal keyboard`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await begin(page);
    await page.addStyleTag({ content: 'body { font-size: 34px !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    for (const button of await page.locator('.hud button,.board button').all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    const sheet = page.getByRole('button', { name: 'Sheet', exact: true });
    await sheet.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Marcus Torin' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(e => e.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate(e => e.contains(document.activeElement))).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('mobile-sheet.png'), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(sheet).toBeFocused();
    const styles = await sheet.evaluate(e => getComputedStyle(e).outlineStyle);
    expect(styles).not.toBe('none');
  });
}

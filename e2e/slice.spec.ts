import { expect, test, type Page } from '@playwright/test';

const key = 'lighthouse-narrative-slice-save-v4';
// A clean Start uses RunController's fixed default seed 0. Never inject game state or mock rules.
const saved = (page: Page) => page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);

for (const keep of [true, false]) {
  test(`seven-scene slice: ${keep ? 'keep' : 'withdraw'} request`, async ({ page }) => {
    const external: string[] = [];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== 'http://127.0.0.1:4173') {
        external.push(url.href);
        return route.abort();
      }
      return route.continue();
    });
    await page.emulateMedia({ colorScheme: keep ? 'dark' : 'light' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Cycle offers' })).toBeVisible();
    const initial = await saved(page);
    expect(initial.run.cycle.cycle).toBe(1);
    expect(initial.run.completed).toEqual([]);

    let scenes = 0,
      rolls = 0,
      accepted = 0;
    async function play(title: string, firstChoice = 0) {
      await page
        .locator('.board-card')
        .filter({ has: page.locator('.board-title', { hasText: title }) })
        .click();
      await expect(page.getByRole('heading', { name: `Prepare assignment: ${title}`, exact: true })).toBeVisible();
      await page.getByRole('button', { name: /Confirm assignment/ }).click();
      await expect.poll(async () => (await saved(page)).run.phase).toBe('scene');
      let choice = 0;
      for (let step = 0; step < 12; step++) {
        const state = await saved(page);
        const before = await page.locator('#app').textContent();
        if (state.run.phase !== 'scene') {
          scenes++;
          return;
        }
        const roll = page.getByRole('button', { name: 'Try it', exact: true });
        const accept = page.getByRole('button', { name: 'Accept the result', exact: true });
        if (await roll.count()) {
          await roll.click();
          rolls++;
        } else if (await accept.count()) {
          await accept.click();
          accepted++;
        } else
          await page
            .locator('.dock .choices button')
            .nth(choice++ === 0 ? firstChoice : 0)
            .click();
        await expect.poll(() => page.locator('#app').textContent()).not.toBe(before);
      }
      throw new Error(`Scene did not finish: ${title}`);
    }
    async function boundary(cycle: number) {
      await expect(page.getByRole('heading', { name: `Cycle ${cycle} settled`, exact: true })).toBeVisible();
      const before = await saved(page);
      await page.reload();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await expect(page.getByRole('heading', { name: `Cycle ${cycle} settled`, exact: true })).toBeVisible();
      expect(await saved(page)).toEqual(before);
      await page.getByRole('button', { name: `Start cycle ${cycle + 1}`, exact: true }).click();
      await expect(page.getByRole('heading', { name: `Cycle ${cycle + 1}`, exact: true })).toBeFocused();
    }
    async function roster() {
      // Fixed policy: first roster offer in the seeded board, first approach, never spend Edge.
      const card = page
        .locator('.board-card')
        .filter({ has: page.locator('.board-kind', { hasText: /Crisis|Commercial/ }) })
        .first();
      await play((await card.locator('.board-title').textContent())!);
    }
    await play('The Written Clause');
    await play('[STUB] The Passenger');
    await boundary(1);
    await roster();
    await play('[STUB] The Silent Hab');
    await boundary(2);
    await play('[STUB] The Dark Lane');
    await roster();
    await boundary(3);
    await play('[STUB] The Asking', keep ? 0 : 1);
    await expect(page.getByRole('button', { name: 'Play again', exact: true })).toBeVisible();
    const end = await saved(page);
    expect(scenes).toBe(7);
    expect(rolls).toBe(8);
    expect(accepted).toBeGreaterThan(0);
    expect(end.run.phase).toBe('ended');
    expect(end.run.cycle.cycle).toBe(4);
    expect(end.bg).toBe(keep ? 'end_closed' : 'end_open');
    expect(
      end.ledger.filter((n: { command?: { code: string } }) => n.command?.code === 'upkeepSettlement'),
    ).toHaveLength(3);
    await page.reload();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Play again', exact: true })).toBeVisible();
    expect(await saved(page)).toEqual(end);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.getByRole('button', { name: 'Play again', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Cycle offers' })).toBeVisible();
    expect((await saved(page)).run.completed).toEqual([]);
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

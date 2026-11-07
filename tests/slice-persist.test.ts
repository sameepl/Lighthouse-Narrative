import { afterEach, expect, it, vi } from 'vitest';
import { data } from '../src/data';
import { GameSession } from '../src/bridge/session';
import inkJson from '../src/story/main.ink';
import { clearSave, startGame, writeSave } from '../src/ui/persist';
import { simulationSeason } from './simulation-fixtures';

vi.mock('../src/data', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/data')>();
  const { simulationSeason, simulationKeystones } = await import('./simulation-fixtures');
  const { full: _full, ...season } = simulationSeason;
  return { ...actual, data: { ...actual.data, season, keystones: simulationKeystones } };
});
afterEach(() => vi.unstubAllGlobals());

it('keeps browser modes separate and resumes a slice after full mode becomes available', async () => {
  const values = new Map([
    ['lighthouse-narrative-save-v4', 'existing full save'],
    ['lighthouse-narrative-save-v3', 'existing legacy save'],
  ]);
  const old = new Map(values);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  const fresh = startGame();
  expect(fresh.save().run.cycle.pursuit.length).toBe(data.rules.cycle.pursuit.sliceLength);
  expect(values).toEqual(old);
  writeSave(fresh);
  expect(values.has('lighthouse-narrative-slice-save-v4')).toBe(true);
  expect(startGame().save()).toEqual(fresh.save());
  const resumed = new GameSession({ data, inkJson, saved: fresh.save() });
  resumed.restart();
  expect(resumed.save().run.cycle.pursuit.length).toBe(data.rules.cycle.pursuit.sliceLength);
  clearSave();
  expect(values).toEqual(old);
  values.clear();
  writeSave(fresh);
  data.season = simulationSeason;
  vi.resetModules();
  const future = await import('../src/ui/persist');
  expect(future.startGame().save()).toEqual(fresh.save());
  const full = new GameSession({ data, inkJson, slice: false });
  future.writeSave(full);
  expect(future.startGame().save()).toEqual(full.save());
  future.clearSave();
  expect(values.has('lighthouse-narrative-save-v4')).toBe(false);
  expect(future.startGame().save()).toEqual(fresh.save());
  future.clearSave();
  expect(values.size).toBe(0);
  values.set('lighthouse-narrative-slice-save-v4', 'rollback must not inspect this slot');
  data.season = { status: 'unconfigured' };
  vi.resetModules();
  const rollback = await import('../src/ui/persist');
  expect(rollback.startGame().save().run.cycle.pursuit.length).toBe(data.rules.cycle.pursuit.length);
  expect(values.get('lighthouse-narrative-slice-save-v4')).toBe('rollback must not inspect this slot');
});

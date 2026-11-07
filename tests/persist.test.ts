import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/ui/App';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSave, newGame, readSavedGame, startGame, writeSave } from '../src/ui/persist';
import { GameSession } from '../src/bridge/session';
import type { SaveData } from '../src/bridge/types';
import { data } from '../src/data';
import inkJson from '../src/story/main.ink';
import { simulationSeason } from './simulation-fixtures';
// Persistence tests need a stable encounter cache, independent of the active production season.
vi.mock('../src/data', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/data')>();
  return {
    ...actual,
    data: {
      ...actual.data,
      encounters: actual.data.encounters.filter(entry => entry.id === 'written_clause'),
      keystones: [],
      season: { status: 'unconfigured' },
    },
  };
});

afterEach(() => vi.unstubAllGlobals());
describe('versioned browser persistence', () => {
  it('probes title saves without writing, validates fallback, and starts fresh only on request', () => {
    const original = new GameSession({ inkJson, data }).save();
    original.res.Credits = 123;
    const legacy = JSON.parse(JSON.stringify(original));
    legacy.v = 3;
    delete legacy.run.ending;
    for (const key of ['arrears', 'upkeepShortfall', 'failed']) delete legacy.run.cycle[key];
    const values = new Map([
      ['lighthouse-narrative-save-v4', '{"v":4}'],
      ['lighthouse-narrative-save-v3', JSON.stringify(legacy)],
    ]);
    const before = new Map(values);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    expect(renderToStaticMarkup(createElement(App))).toContain('>Continue</button>');
    expect(values).toEqual(before);
    const continued = readSavedGame()!;
    expect(continued.save().res.Credits).toBe(123);
    expect(values).toEqual(before);
    writeSave(continued);
    expect(readSavedGame()!.save()).toEqual(continued.save());
    expect(values.has('lighthouse-narrative-save-v3')).toBe(false);
    const fresh = newGame();
    expect(fresh.save().res.Credits).toBe(data.rules.resources.Credits!.start);
    expect(values.size).toBe(0);
    expect(readSavedGame()).toBeNull();
    values.set('lighthouse-narrative-save-v4', '{"v":4}');
    expect(readSavedGame()).toBeNull();
    expect(values.size).toBe(1);
    values.clear();
    const slice = new GameSession({ inkJson, data, slice: true }).save();
    values.set('lighthouse-narrative-slice-save-v4', JSON.stringify(slice));
    const beforeSlice = new Map(values);
    expect(readSavedGame()).toBeNull();
    const priorSeason = data.season;
    data.season = simulationSeason;
    try {
      expect(readSavedGame()!.save()).toEqual(slice);
      expect(values).toEqual(beforeSlice);
      values.set('lighthouse-narrative-save-v4', JSON.stringify(original));
      expect(readSavedGame()!.save()).toEqual(original);
    } finally {
      data.season = priorSeason;
    }
  });

  it('migrates a detached complete v3 only after validation and retains it on write failure', () => {
    const original = new GameSession({ inkJson, data }).save();
    const legacy = JSON.parse(JSON.stringify(original));
    legacy.v = 3;
    delete legacy.run.ending;
    for (const key of ['arrears', 'upkeepShortfall', 'failed']) delete legacy.run.cycle[key];
    const raw = JSON.stringify(legacy);
    const values = new Map([['lighthouse-narrative-save-v3', raw]]);
    const setItem = vi.fn((key: string, value: string) => {
      values.set(key, value);
    });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem,
      removeItem: (key: string) => values.delete(key),
    });
    setItem.mockImplementationOnce(() => {
      throw new Error('quota');
    });
    expect(startGame().save()).toEqual(original);
    expect(values.get('lighthouse-narrative-save-v3')).toBe(raw);
    expect(startGame().save()).toEqual(original);
    expect(values.has('lighthouse-narrative-save-v3')).toBe(false);
    expect(JSON.parse(values.get('lighthouse-narrative-save-v4')!)).toEqual(original);
    expect(legacy.run.ending).toBeUndefined();
    values.set('lighthouse-narrative-save-v4', '{"v":4}');
    values.set('lighthouse-narrative-save-v3', raw);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const migrated = startGame();
    const control = new GameSession({ inkJson, data, saved: original });
    migrated.endCycle();
    control.endCycle();
    expect(migrated.save()).toEqual(control.save());
    warning.mockRestore();
    values.set('lighthouse-narrative-save-v4', JSON.stringify(original));

    // A valid current save wins even when a different valid legacy save exists.
    legacy.res.Credits = 0;
    values.set('lighthouse-narrative-save-v3', JSON.stringify(legacy));
    expect(startGame().save()).toEqual(original);
    for (const mutate of [
      (s: typeof legacy) => {
        s.run.crewTrust = {};
      },
      (s: typeof legacy) => {
        s.run.rngState = -1;
      },
      (s: typeof legacy) => {
        s.run.encounterBoard = undefined;
      },
      (s: typeof legacy) => {
        s.run.cycle.actionsLeft = -1;
      },
    ]) {
      const invalid = JSON.parse(raw);
      mutate(invalid);
      expect(() => new GameSession({ inkJson, data, saved: invalid })).toThrow();
    }
  });

  it.each([-1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '1', null, undefined])(
    'rejects invalid v4 counters %s',
    value => {
      const valid = new GameSession({ inkJson, data }).save();
      for (const field of ['arrears', 'upkeepShortfall']) {
        const broken = structuredClone(valid);
        Object.assign(broken.run.cycle, { [field]: value });
        expect(() => new GameSession({ inkJson, data, saved: broken })).toThrow('Invalid version 4 save');
      }
    },
  );

  it.each(['offers', 'active', 'encounterBoard'] as const)('discards invalid cached %s titles', path => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const session = startGame();
    const fresh = session.save();
    const selected = fresh.run.offers.find(offer => offer.kind === 'encounter')!.entry;
    session.pickOffer(selected.id);
    const valid = session.save();
    writeSave(session);
    expect(startGame().save()).toEqual(valid);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const title of [undefined, '', 42]) {
      // JSON makes the three cached entries independent, as they are in browser storage.
      const broken = JSON.parse(JSON.stringify(valid)) as SaveData;
      const entries = {
        offers: broken.run.offers.find(offer => offer.entry.id === selected.id)!.entry,
        active: broken.run.active!.entry,
        encounterBoard: broken.run.encounterBoard!.find(entry => entry.id === selected.id)!,
      };
      if (title === undefined) Reflect.deleteProperty(entries[path], 'title');
      else Object.assign(entries[path], { title });
      for (const other of ['offers', 'active', 'encounterBoard'] as const)
        if (other !== path) expect(entries[other].title).toBe(selected.title);
      expect(() => new GameSession({ inkJson, data, saved: broken })).toThrow('Invalid version 4 save');
      values.set('lighthouse-narrative-save-v4', JSON.stringify(broken));
      const restarted = startGame().save();
      expect(restarted).toEqual({ ...fresh, ink: expect.any(String) });
      // Ink gives each fresh story a random seed; its remaining state must be fresh too.
      expect(JSON.parse(restarted.ink)).toEqual({ ...JSON.parse(fresh.ink), storySeed: expect.any(Number) });
      expect(values.has('lighthouse-narrative-save-v4')).toBe(false);
    }
    expect(warning).toHaveBeenCalledTimes(3);
    warning.mockRestore();
  });

  it('discards legacy and malformed saves, then stores and restores version 4', () => {
    const values = new Map<string, string>([
      ['lighthouse-narrative-save-v1', '{"v":1}'],
      ['lighthouse-narrative-save-v2', '{"v":2}'],
    ]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const session = startGame();
    expect(values.has('lighthouse-narrative-save-v1')).toBe(false);
    expect(values.has('lighthouse-narrative-save-v2')).toBe(false);
    expect(session.store.getState().phase).toBe('hub');
    writeSave(session);
    expect(startGame().save()).toEqual(session.save());
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const valid = session.save();
    for (const broken of [
      { v: 4 },
      { ...valid, run: { ...valid.run, crewTrust: {} } },
      { ...valid, run: { ...valid.run, crewTrust: { ...valid.run.crewTrust, priya: 4 } } },
      { ...valid, run: { ...valid.run, phase: 'invalid' } },
      { ...valid, run: { ...valid.run, rngState: -1 } },
      { ...valid, run: { ...valid.run, cycle: { ...valid.run.cycle, pursuit: { value: 99, length: 6 } } } },
    ]) {
      values.set('lighthouse-narrative-save-v4', JSON.stringify(broken));
      const fresh = startGame().save();
      expect(fresh.run).toEqual(valid.run);
      expect(fresh.res).toEqual(valid.res);
      expect(fresh.events).toEqual([]);
      expect(values.has('lighthouse-narrative-save-v4')).toBe(false);
    }
    warning.mockRestore();
    clearSave();
    expect(values.size).toBe(0);
  });
});

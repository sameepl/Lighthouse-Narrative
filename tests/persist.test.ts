import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSave, startGame, writeSave } from '../src/ui/persist';
import { GameSession } from '../src/bridge/session';
import type { SaveData } from '../src/bridge/types';
import { data } from '../src/data';
import inkJson from '../src/story/main.ink';
afterEach(() => vi.unstubAllGlobals());
describe('versioned browser persistence', () => {
  it.each(['offers', 'active', 'encounterBoard'] as const)('discards invalid cached %s titles', path => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const session = startGame();
    const fresh = session.save();
    session.pickOffer('written_clause');
    const valid = session.save();
    writeSave(session);
    expect(startGame().save()).toEqual(valid);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const title of [undefined, '', 42]) {
      // JSON makes the three cached entries independent, as they are in browser storage.
      const broken = JSON.parse(JSON.stringify(valid)) as SaveData;
      const entries = {
        offers: broken.run.offers[0]!.entry,
        active: broken.run.active!.entry,
        encounterBoard: broken.run.encounterBoard![0]!,
      };
      if (title === undefined) Reflect.deleteProperty(entries[path], 'title');
      else Object.assign(entries[path], { title });
      for (const other of ['offers', 'active', 'encounterBoard'] as const)
        if (other !== path) expect(entries[other].title).toBe('The Written Clause');
      expect(() => new GameSession({ inkJson, data, saved: broken })).toThrow('Invalid version 2 save');
      values.set('lighthouse-narrative-save-v2', JSON.stringify(broken));
      const restarted = startGame().save();
      expect(restarted).toEqual({ ...fresh, ink: expect.any(String) });
      // Ink gives each fresh story a random seed; its remaining state must be fresh too.
      expect(JSON.parse(restarted.ink)).toEqual({ ...JSON.parse(fresh.ink), storySeed: expect.any(Number) });
      expect(values.has('lighthouse-narrative-save-v2')).toBe(false);
    }
    expect(warning).toHaveBeenCalledTimes(3);
    warning.mockRestore();
  });

  it('discards legacy and malformed saves, then stores and restores version 2', () => {
    const values = new Map<string, string>([['lighthouse-narrative-save-v1', '{"v":1}']]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const session = startGame();
    expect(values.has('lighthouse-narrative-save-v1')).toBe(false);
    expect(session.store.getState().phase).toBe('hub');
    writeSave(session);
    expect(startGame().save()).toEqual(session.save());
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const valid = session.save();
    for (const broken of [
      { v: 2 },
      { ...valid, run: { ...valid.run, phase: 'invalid' } },
      { ...valid, run: { ...valid.run, rngState: -1 } },
      { ...valid, run: { ...valid.run, cycle: { ...valid.run.cycle, pursuit: { value: 99, length: 6 } } } },
    ]) {
      values.set('lighthouse-narrative-save-v2', JSON.stringify(broken));
      const fresh = startGame().save();
      expect(fresh.run).toEqual(valid.run);
      expect(fresh.res).toEqual(valid.res);
      expect(fresh.events).toEqual([]);
      expect(values.has('lighthouse-narrative-save-v2')).toBe(false);
    }
    warning.mockRestore();
    clearSave();
    expect(values.size).toBe(0);
  });
});

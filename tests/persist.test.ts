import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSave, startGame, writeSave } from '../src/ui/persist';
afterEach(() => vi.unstubAllGlobals());
describe('versioned browser persistence', () => {
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

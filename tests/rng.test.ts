import { describe, expect, it } from 'vitest';
import { createSeededRng } from '../src/engine/rng';

describe('seeded RNG', () => {
  it('repeats from the same seed and restores a saved numeric state', () => {
    const first = createSeededRng(42);
    const second = createSeededRng(42);
    expect(first.next()).toBe(second.next());
    const saved = first.getState();
    const next = first.next();
    second.setState(saved);
    expect(second.next()).toBe(next);
    expect(Array.from({ length: 100 }, () => first.next()).every(value => value >= 0 && value < 1)).toBe(true);
  });

  it('wraps unsigned state and rejects invalid seed or restored state', () => {
    const rng = createSeededRng(0xffffffff);
    rng.next();
    expect(rng.getState()).toBe(0x6d2b79f4);
    expect(() => createSeededRng(-1)).toThrow(/uint32/);
    expect(() => createSeededRng(1.5)).toThrow(/uint32/);
    expect(() => createSeededRng(0x100000000)).toThrow(/uint32/);
    expect(() => rng.setState(Number.NaN)).toThrow(/uint32/);
  });
});

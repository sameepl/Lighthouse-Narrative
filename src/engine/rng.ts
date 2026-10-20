/** A deterministic random stream whose unsigned 32-bit state can be saved. */
export interface SeededRng {
  next(): number;
  getState(): number;
  setState(state: number): void;
}

const MAX_STATE = 0xffffffff;

export function createSeededRng(seed: number): SeededRng {
  if (!Number.isInteger(seed) || seed < 0 || seed > MAX_STATE) throw new Error('RNG seed must be a uint32');
  let state = seed;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let n = state;
      n = Math.imul(n ^ (n >>> 15), n | 1);
      n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
      return ((n ^ (n >>> 14)) >>> 0) / 0x100000000;
    },
    getState: () => state,
    setState(nextState) {
      if (!Number.isInteger(nextState) || nextState < 0 || nextState > MAX_STATE)
        throw new Error('RNG state must be a uint32');
      state = nextState;
    },
  };
}

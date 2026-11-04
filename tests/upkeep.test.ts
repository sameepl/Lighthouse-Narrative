import { describe, expect, it } from 'vitest';
import { data } from '../src/data';
import { newGameState } from '../src/engine/rules';
import { newUpkeepState, settleUpkeep, upkeepTargetPenalty } from '../src/engine/upkeep';

const { rules } = data;
const game = (credits = 500, renown = 3, strain = 0) => ({
  ...newGameState(rules),
  res: { ...newGameState(rules).res, Credits: credits, Renown: renown, Strain: strain },
});

describe('standalone upkeep settlement', () => {
  it('starts clean and returns independent state objects', () => {
    expect(newUpkeepState()).toEqual({ arrears: 0, upkeepShortfall: 0, failed: false });
    expect(newUpkeepState()).not.toBe(newUpkeepState());
  });

  it.each([0, 500])('consumes available Credits and advances arrears once for a miss (%i)', credits => {
    const result = settleUpkeep(game(credits), newUpkeepState(), 1000, rules);
    expect(result.game.res).toMatchObject({ Credits: 0, Renown: 2, Strain: 0 });
    expect(result.state).toEqual({ arrears: 1, upkeepShortfall: 1000 - credits, failed: false });
    expect(result.report).toEqual({
      upkeepDue: 1000,
      upkeepPaid: credits,
      upkeepShortfall: 1000 - credits,
      arrearsBefore: 0,
      arrearsAfter: 1,
      renownLost: 1,
      strainAdded: 0,
      warning: false,
      failed: false,
    });
  });

  it.each([500, 1500])('fully pays without a miss when Credits cover the bill (%i)', credits => {
    const result = settleUpkeep(game(credits), { arrears: 2, upkeepShortfall: 900, failed: false }, 500, rules);
    expect(result.game.res).toMatchObject({ Credits: credits - 500, Renown: 3, Strain: 0 });
    expect(result.state).toEqual({ arrears: 1, upkeepShortfall: 0, failed: false });
    expect(result.report).toMatchObject({ upkeepPaid: 500, renownLost: 0, strainAdded: 0, warning: false });
  });

  it('treats zero upkeep as full payment and recovers one arrears level, floored at zero', () => {
    const first = settleUpkeep(game(0), { arrears: 1, upkeepShortfall: 100, failed: false }, 0, rules);
    expect(first.state).toEqual(newUpkeepState());
    const again = settleUpkeep(first.game, first.state, 0, rules);
    expect(again.state).toEqual(newUpkeepState());
    expect(again.game.res).toEqual(first.game.res);
  });

  it('warns two misses before failure and applies Strain at resulting arrears 2', () => {
    let result = settleUpkeep(game(0), newUpkeepState(), 1, rules);
    result = settleUpkeep(result.game, result.state, 1, rules);
    expect(result.state.arrears).toBe(2);
    expect(result.report).toMatchObject({ warning: true, failed: false, renownLost: 1, strainAdded: 1 });
    result = settleUpkeep(result.game, result.state, 1, rules);
    expect(result.report).toMatchObject({ warning: true, failed: false, strainAdded: 1 });
    result = settleUpkeep(result.game, result.state, 1, rules);
    expect(result.state).toEqual({ arrears: 4, upkeepShortfall: 1, failed: true });
    expect(result.report).toMatchObject({ warning: false, failed: true });
    expect(() => settleUpkeep(game(10000), result.state, 1, rules)).toThrow(/after arrears failure/);
  });

  it('reports actual resource changes after Renown and Strain clamps', () => {
    const result = settleUpkeep(game(0, 0, 5), { ...newUpkeepState(), arrears: 1 }, 500, rules);
    expect(result.game.res).toMatchObject({ Credits: 0, Renown: 0, Strain: 5 });
    expect(result.report).toMatchObject({ renownLost: 0, strainAdded: 0 });
    const changed = {
      ...rules,
      cycle: { ...rules.cycle, upkeep: { ...rules.cycle.upkeep, renownLoss: 3, strainGain: 2 } },
    };
    const partial = settleUpkeep(game(0, 1, 4), { ...newUpkeepState(), arrears: 1 }, 500, changed);
    expect(partial.report).toMatchObject({ renownLost: 1, strainAdded: 1 });
  });

  it('recovers one level at a time without burning resources on a paid bill', () => {
    const first = settleUpkeep(game(2000), { ...newUpkeepState(), arrears: 3 }, 500, rules);
    expect(first.state.arrears).toBe(2);
    expect(first.report).toMatchObject({ warning: true, renownLost: 0, strainAdded: 0 });
    const next = settleUpkeep(first.game, first.state, 500, rules);
    expect(next.state.arrears).toBe(1);
    expect(next.game.res.Credits).toBe(1000);
    expect(next.report.warning).toBe(false);
  });

  it('accepts frozen inputs without mutation, ledger changes, or RNG', () => {
    const before = game();
    Object.freeze(before.res);
    Object.freeze(before.ledger);
    Object.freeze(before);
    const state = Object.freeze(newUpkeepState());
    expect(settleUpkeep(before, state, 1000, rules)).toEqual(settleUpkeep(before, state, 1000, rules));
    expect(before.res.Credits).toBe(500);
    expect(before.ledger).toEqual([]);
    expect(state).toEqual(newUpkeepState());
  });

  it.each([-1, 0.5, NaN, Infinity])('rejects invalid bills without changing Credits (%s)', due => {
    const before = game();
    expect(() => settleUpkeep(before, newUpkeepState(), due, rules)).toThrow(/nonnegative safe integer/);
    expect(before.res.Credits).toBe(500);
  });

  it('rejects terminal arrears even when the failed flag is false', () => {
    expect(() => settleUpkeep(game(), { ...newUpkeepState(), arrears: 4 }, 0, rules)).toThrow(/failure/);
  });
});

describe('upkeep target penalty', () => {
  it('affects only ship-dependent checks and does not stack with arrears', () => {
    for (const arrears of [0, 1, 2, 3, 4]) {
      expect(upkeepTargetPenalty(arrears, true, rules)).toBe(arrears === 0 ? 0 : 1);
      expect(upkeepTargetPenalty(arrears, false, rules)).toBe(0);
    }
    const changed = {
      ...rules,
      cycle: { ...rules.cycle, upkeep: { ...rules.cycle.upkeep, targetFrom: 2, targetPenalty: 2 } },
    };
    expect(upkeepTargetPenalty(1, true, changed)).toBe(0);
    expect(upkeepTargetPenalty(3, true, changed)).toBe(2);
  });
});

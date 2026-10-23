import { describe, expect, it } from 'vitest';
import { data } from '../src/data';
import { assistOf, changeTrust, earnEdge, endCycle, newCycleState } from '../src/engine/cycle';
import { newGameState } from '../src/engine/rules';

const { rules, ships, crew } = data;

describe('cycle state and Pursuit', () => {
  it('starts with two actions and the run or slice clock length', () => {
    expect(newCycleState(rules)).toEqual({
      cycle: 1,
      actionsLeft: 2,
      pursuit: { value: 0, length: 6 },
      edgeEarnedCrewIds: [],
    });
    expect(newCycleState(rules, true).pursuit.length).toBe(4);
  });

  it('resets actions, advances cycle, and charges no upkeep for no ships', () => {
    const cycle = { ...newCycleState(rules), actionsLeft: 0 };
    const game = newGameState(rules);
    const result = endCycle(cycle, game, [], {}, rules);
    expect(result.cycle).toMatchObject({ cycle: 2, actionsLeft: 2, pursuit: { value: 1 } });
    expect(result.report).toEqual({ upkeep: 0, upkeepDue: 0, pursuitDelta: 1, full: false });
    expect(result.game.res.Credits).toBe(52000);
    expect(cycle.pursuit.value).toBe(0);
    expect(game.res.Credits).toBe(52000);
  });

  it('charges only ships in service and reports unpaid upkeep when Credits run out', () => {
    const cycle = newCycleState(rules);
    const game = newGameState(rules);
    const one = endCycle(cycle, game, [ships[0]!], {}, rules);
    expect(one.report).toMatchObject({ upkeep: 1000, upkeepDue: 1000 });
    expect(one.game.res.Credits).toBe(51000);
    const broke = { ...game, res: { ...game.res, Credits: 500 } };
    const both = endCycle(cycle, broke, ships, {}, rules);
    expect(both.report).toMatchObject({ upkeep: 500, upkeepDue: 4000 });
    expect(both.game.res.Credits).toBe(0);
    expect(broke.res.Credits).toBe(500);
  });

  it('rejects duplicate in-service ships', () => {
    expect(() => endCycle(newCycleState(rules), newGameState(rules), [ships[0]!, ships[0]!], {}, rules)).toThrow(
      /Duplicate in-service ship id/,
    );
  });

  it('stacks Renown, loud, and quiet independently at the threshold', () => {
    const cycle = newCycleState(rules);
    const game = newGameState(rules);
    const atTwo = { ...game, res: { ...game.res, Renown: 2 } };
    const atThree = { ...game, res: { ...game.res, Renown: 3 } };
    expect(endCycle(cycle, atTwo, [], {}, rules).report.pursuitDelta).toBe(1);
    expect(endCycle(cycle, atThree, [], {}, rules).report.pursuitDelta).toBe(2);
    expect(endCycle(cycle, atThree, [], { loud: true }, rules).report.pursuitDelta).toBe(3);
    expect(endCycle(cycle, atThree, [], { quiet: true }, rules).report.pursuitDelta).toBe(1);
    expect(endCycle(cycle, atThree, [], { loud: true, quiet: true }, rules).report.pursuitDelta).toBe(2);
    expect(endCycle(cycle, atTwo, [], { quiet: true }, rules).report.pursuitDelta).toBe(0);
  });

  it('clamps at zero and full and reports the actual change', () => {
    const cycle = newCycleState(rules, true);
    const game = newGameState(rules);
    const fasterQuiet = {
      ...rules,
      cycle: { ...rules.cycle, pursuit: { ...rules.cycle.pursuit, quietDelta: -2 } },
    };
    expect(endCycle(cycle, game, [], { quiet: true }, fasterQuiet).report.pursuitDelta).toBe(0);
    const nearFull = { ...cycle, pursuit: { ...cycle.pursuit, value: 3 } };
    const full = endCycle(nearFull, game, [], { loud: true }, rules);
    expect(full.cycle.pursuit.value).toBe(4);
    expect(full.report).toMatchObject({ pursuitDelta: 1, full: true });
    expect(endCycle(full.cycle, full.game, [], {}, rules).report).toMatchObject({ pursuitDelta: 0, full: true });
  });
});

describe('crew rewards and assist', () => {
  it('adds one Edge at trust 3 once per crew, preserving history across cycles', () => {
    const cycle = newCycleState(rules);
    const game = { ...newGameState(rules), res: { ...newGameState(rules).res, Edge: 1 } };
    const member = { id: crew[0]!.id, trust: 3 };
    const first = earnEdge(cycle, game, member, member.trust, rules);
    expect(first.report).toEqual({ rewardConsumed: true, edgeAdded: 1 });
    expect(first.game.res.Edge).toBe(2);
    expect(first.cycle.edgeEarnedCrewIds).toEqual([member.id]);
    expect(cycle.edgeEarnedCrewIds).toEqual([]);
    expect(game.res.Edge).toBe(1);

    const next = endCycle(first.cycle, first.game, [], {}, rules);
    expect(earnEdge(next.cycle, next.game, member, 2, rules).report.rewardConsumed).toBe(false);
    expect(earnEdge(next.cycle, next.game, member, member.trust, rules).report).toEqual({
      rewardConsumed: false,
      edgeAdded: 0,
    });
  });

  it('consumes each crew reward even at the Edge cap', () => {
    const cycle = newCycleState(rules);
    const game = newGameState(rules);
    const first = earnEdge(cycle, game, crew[0]!, 3, rules);
    expect(first.report).toEqual({ rewardConsumed: true, edgeAdded: 0 });
    const spent = { ...first.game, res: { ...first.game.res, Edge: 2 } };
    expect(earnEdge(first.cycle, spent, crew[0]!, 3, rules).report.edgeAdded).toBe(0);
    const second = earnEdge(first.cycle, spent, crew[1]!, 3, rules);
    expect(second.report).toEqual({ rewardConsumed: true, edgeAdded: 1 });
    expect(second.game.res.Edge).toBe(3);
    expect(earnEdge(cycle, game, crew[2]!, 2, rules).report.rewardConsumed).toBe(false);
  });

  it('uses the configured Edge reward and reports the amount after the cap', () => {
    const changedRules = { ...rules, cycle: { ...rules.cycle, edgeReward: 2 } };
    const cycle = newCycleState(changedRules);
    const game = newGameState(changedRules);
    const empty = { ...game, res: { ...game.res, Edge: 0 } };
    const reward = earnEdge(cycle, empty, crew[0]!, 3, changedRules);
    expect(reward.report).toEqual({ rewardConsumed: true, edgeAdded: 2 });
    expect(reward.game.res.Edge).toBe(2);
    const nearCap = { ...game, res: { ...game.res, Edge: 2 } };
    const capped = earnEdge(cycle, nearCap, crew[1]!, 3, changedRules);
    expect(capped.report).toEqual({ rewardConsumed: true, edgeAdded: 1 });
    expect(capped.game.res.Edge).toBe(3);
  });

  it('returns a +1 assist, or +2 at trust 3, without changing crew data', () => {
    const member = crew[0]!;
    expect(assistOf(member, member.trust, rules)).toEqual(member.assist);
    expect(assistOf(member, 3, rules)).toEqual({ ...member.assist, n: 2 });
    expect(member.trust).toBe(0);
  });
});

describe('run trust', () => {
  it('clamps both ways without changing its input or other crew', () => {
    const before = { priya: 1, cass: 2 };
    expect(changeTrust(before, 'priya', 1)).toEqual({ priya: 2, cass: 2 });
    expect(changeTrust(before, 'priya', 99).priya).toBe(3);
    expect(changeTrust(before, 'priya', -99).priya).toBe(0);
    expect(before).toEqual({ priya: 1, cass: 2 });
  });
  it('rejects unknown IDs, inherited object names and noninteger deltas', () => {
    for (const id of ['missing', '__proto__', 'constructor', 'toString'])
      expect(() => changeTrust({ priya: 0, cass: 0 }, id, 1)).toThrow(/Known: priya, cass/);
    for (const n of [NaN, Infinity, 0.5]) expect(() => changeTrust({ priya: 0 }, 'priya', n)).toThrow(/finite integer/);
  });
});

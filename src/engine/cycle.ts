import type { Crew, Rules, Ships } from '../data/schema';
import { addResource } from './rules';
import type { CycleState, GameState } from './types';

export interface CycleReport {
  upkeep: number;
  upkeepDue: number;
  pursuitDelta: number;
  full: boolean;
}

export interface EdgeReport {
  /** A first trust-3 reward was consumed, even if the Edge pool was full. */
  rewardConsumed: boolean;
  /** Actual Edge added after the pool cap. */
  edgeAdded: number;
}

/** Start a full run, or a four-segment vertical slice. */
export function newCycleState(rules: Rules, slice = false): CycleState {
  return {
    cycle: 1,
    actionsLeft: rules.cycle.actions,
    pursuit: { value: 0, length: slice ? rules.cycle.pursuit.sliceLength : rules.cycle.pursuit.length },
    edgeEarnedCrewIds: [],
  };
}

/** Pays available Credits and advances the cycle and Pursuit without changing the inputs. */
export function endCycle(
  cycle: CycleState,
  game: GameState,
  inServiceShips: readonly Ships[number][],
  choice: { loud?: boolean; quiet?: boolean },
  rules: Rules,
): { cycle: CycleState; game: GameState; report: CycleReport } {
  const ids = inServiceShips.map(ship => ship.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate in-service ship id');

  const upkeepDue = inServiceShips.reduce((sum, ship) => sum + ship.upkeep, 0);
  const res = { ...game.res };
  const creditsBefore = res.Credits ?? rules.resources.Credits!.start;
  const creditsAfter = addResource(res, rules, 'Credits', -upkeepDue);
  const upkeep = creditsBefore - creditsAfter;

  const pursuitRule = rules.cycle.pursuit;
  const requestedDelta =
    pursuitRule.base +
    ((res.Renown ?? rules.resources.Renown!.start) >= pursuitRule.renownThreshold ? pursuitRule.renownDelta : 0) +
    (choice.loud ? pursuitRule.loudDelta : 0) +
    (choice.quiet ? pursuitRule.quietDelta : 0);
  const pursuitValue = Math.max(0, Math.min(cycle.pursuit.length, cycle.pursuit.value + requestedDelta));
  const nextCycle: CycleState = {
    ...cycle,
    cycle: cycle.cycle + 1,
    actionsLeft: rules.cycle.actions,
    pursuit: { ...cycle.pursuit, value: pursuitValue },
  };
  return {
    cycle: nextCycle,
    game: { ...game, res },
    report: {
      upkeep,
      upkeepDue,
      pursuitDelta: pursuitValue - cycle.pursuit.value,
      full: pursuitValue === cycle.pursuit.length,
    },
  };
}

/** A crew member can grant Edge once in a run at trust 3; a full pool still consumes that reward. */
export function earnEdge(
  cycle: CycleState,
  game: GameState,
  crew: Pick<Crew[number], 'id' | 'trust'>,
  rules: Rules,
): { cycle: CycleState; game: GameState; report: EdgeReport } {
  if (crew.trust !== rules.cycle.edgeTrust || cycle.edgeEarnedCrewIds.includes(crew.id))
    return { cycle, game, report: { rewardConsumed: false, edgeAdded: 0 } };

  const res = { ...game.res };
  const before = res.Edge ?? rules.resources.Edge!.start;
  const after = addResource(res, rules, 'Edge', rules.cycle.edgeReward);
  return {
    cycle: { ...cycle, edgeEarnedCrewIds: [...cycle.edgeEarnedCrewIds, crew.id] },
    game: { ...game, res },
    report: { rewardConsumed: true, edgeAdded: after - before },
  };
}

/** The assigned crew's single assist grows at trust 3. */
export function assistOf(crew: Pick<Crew[number], 'assist' | 'trust'>, rules: Rules): Crew[number]['assist'] {
  return {
    skill: crew.assist.skill,
    n: crew.assist.n + (crew.trust >= rules.cycle.edgeTrust ? rules.cycle.trustedAssistBonus : 0),
  };
}
// zone test

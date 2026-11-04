import type { Rules } from '../data/schema';
import { addResource } from './rules';
import type { GameState } from './types';

/** Standalone settlement state; cycle and save integration are intentionally separate. */
export interface UpkeepState {
  arrears: number;
  upkeepShortfall: number;
  failed: boolean;
}

export interface UpkeepReport {
  upkeepDue: number;
  upkeepPaid: number;
  upkeepShortfall: number;
  arrearsBefore: number;
  arrearsAfter: number;
  renownLost: number;
  strainAdded: number;
  warning: boolean;
  failed: boolean;
}

export function newUpkeepState(): UpkeepState {
  return { arrears: 0, upkeepShortfall: 0, failed: false };
}

/** Settle only this bill. A miss advances the arrears track; a fully paid bill reduces it. */
export function settleUpkeep(
  game: Readonly<GameState>,
  state: Readonly<UpkeepState>,
  due: number,
  rules: Rules,
): { game: GameState; state: UpkeepState; report: UpkeepReport } {
  if (state.failed || state.arrears >= rules.cycle.upkeep.arrearsLimit)
    throw new Error('Cannot settle upkeep after arrears failure');
  if (!Number.isSafeInteger(due) || due < 0) throw new Error('Upkeep due must be a nonnegative safe integer');
  if (!Number.isSafeInteger(state.arrears) || state.arrears < 0)
    throw new Error('Arrears must be a nonnegative safe integer');
  const upkeep = rules.cycle.upkeep;
  const res = { ...game.res };
  const creditsBefore = res.Credits ?? rules.resources.Credits!.start;
  const upkeepPaid = creditsBefore - addResource(res, rules, 'Credits', -due);
  const upkeepShortfall = due - upkeepPaid;
  const missed = upkeepShortfall > 0;
  const arrears = Math.max(0, state.arrears + (missed ? 1 : -1));
  const renownBefore = res.Renown ?? rules.resources.Renown!.start;
  const strainBefore = res.Strain ?? rules.resources.Strain!.start;
  if (missed) {
    addResource(res, rules, 'Renown', -upkeep.renownLoss);
    if (arrears >= upkeep.strainFrom) addResource(res, rules, 'Strain', upkeep.strainGain);
  }
  const failed = arrears >= upkeep.arrearsLimit;
  return {
    game: { ...game, res },
    state: { arrears, upkeepShortfall, failed },
    report: {
      upkeepDue: due,
      upkeepPaid,
      upkeepShortfall,
      arrearsBefore: state.arrears,
      arrearsAfter: arrears,
      renownLost: renownBefore - (res.Renown ?? renownBefore),
      strainAdded: (res.Strain ?? strainBefore) - strainBefore,
      warning: !failed && arrears >= upkeep.arrearsLimit - upkeep.warningLead,
      failed,
    },
  };
}

/** Ship-dependent checks receive one flat target increase, never one per arrears level. */
export function upkeepTargetPenalty(arrears: number, shipDependent: boolean, rules: Rules): number {
  return shipDependent && arrears >= rules.cycle.upkeep.targetFrom ? rules.cycle.upkeep.targetPenalty : 0;
}

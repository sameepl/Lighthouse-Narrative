import { data } from '../../data';
import type { GameView, PreparationReason } from '../../bridge/types';

export const boardLabels = {
  title: 'Cycle offers',
  cycle: (cycle: number) => `Cycle ${cycle}`,
  actions: (left: number) => `${left} ${left === 1 ? 'action' : 'actions'} left`,
  layers: { crisis: { icon: '⚠', text: 'Crisis' }, commercial: { icon: '◇', text: 'Commercial' } },
  keystone: { icon: '◆', text: 'Keystone' },
  cost: (cost: number) => `Cost Cr${cost}`,
  risk: (risk: string) => `Risk: ${risk}`,
  unlistedCost: 'Cost not listed',
  unlistedRisk: 'Risk not listed',
  forced: 'Forced',
  weak: 'Weaker options',
  locked: 'Locked',
  prepare: 'Select to prepare. You need enough Credits to begin.',
};

export function boardLockText(reason: PreparationReason): string {
  switch (reason.code) {
    case 'insufficientCredits':
      return `Requires Cr${reason.required}; Cr${reason.available} available.`;
    case 'noActionsLeft':
      return 'No actions left.';
    case 'requiredShip':
      return `Requires a ship tagged ${reason.shipTag}.`;
    case 'unsuitableShip':
      return `Ship ${reason.shipId} needs the ${reason.shipTag} tag.`;
    case 'unknownShip':
      return `Unknown ship: ${reason.shipId}.`;
    case 'requiredCrew':
      return `Requires crew: ${reason.crewId}.`;
    case 'unavailableCrew':
      return `Crew unavailable: ${reason.crewId}.`;
    case 'duplicateCrew':
      return 'Duplicate crew assignment.';
  }
}

/** Only the configured, visibly forced opening tutorial receives tutorial wording. */
export function openingTutorial(offers: GameView['offers'], cycle: GameView['cycle']): string | undefined {
  const season = data.season;
  if (season.status !== 'configured' || cycle.cycle !== 1 || cycle.actionsLeft !== 2 || offers.length !== 1)
    return undefined;
  const offer = offers[0]!;
  return offer.kind === 'encounter' && offer.forced && offer.entry.id === season.slice.tutorialId
    ? offer.entry.title
    : undefined;
}

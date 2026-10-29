import type { PreparationView } from '../../bridge/types';

export const prepareLabels = {
  title: 'Prepare assignment',
  ships: 'Ship',
  crew: 'Crew',
  optional: 'A ship is optional. No ship is selected.',
  optionalSelected: 'A ship is optional. Cancel and reopen this offer to reset assignments.',
  required: (tag: string) => `Requires a ship tagged ${tag}.`,
  upkeep: (amount: number) => `Upkeep Cr${amount} per cycle`,
  assist: (skill: string, n: number) => `${n >= 0 ? '+' : ''}${n} ${skill} assist`,
  trust: (trust: number) => `Trust ${trust}`,
  trait: (trait: string) => `Trait: ${trait.replaceAll('_', ' ')}`,
  selected: 'Selected',
  available: 'Available',
  assigned: 'Assigned; busy after confirmation this cycle',
  busy: 'Busy this cycle',
  protected: 'Unavailable for assignment',
  unavailable: 'Assignment unavailable',
  ready: 'Ready to confirm. The action and job cost are committed on confirmation.',
  blocked: 'Before confirming:',
};

export function crewStatus(crew: PreparationView['crew'][number], available: boolean): string {
  return crew.busy
    ? prepareLabels.busy
    : !crew.assignable
      ? prepareLabels.protected
      : !available
        ? prepareLabels.unavailable
        : crew.assigned
          ? prepareLabels.assigned
          : prepareLabels.available;
}

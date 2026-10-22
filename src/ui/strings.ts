import type { BoardStatus, Command, HubStatus, UIChoice } from '../bridge/types';

/** Player-visible words for scheduling. The bridge sends codes and parameters; the wording lives here. */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function hubStatusText(hub: HubStatus): string {
  const lead = `Cycle ${hub.cycle}: ${plural(hub.actionsLeft, 'action', 'actions')} left. `;
  const board: Record<BoardStatus, string> = {
    'pursuit-full': 'Pursuit has reached its limit. No further encounter is available in this prototype.',
    'no-eligible-offers': 'No work is available. End the cycle or restart.',
    'actions-spent': 'End the cycle to pay upkeep and advance Pursuit.',
    ready: 'Choose an offer, then prepare your ship and crew.',
    ended: '',
  };
  return lead + board[hub.board];
}

export function commandText(command: Command): { text: string; sub?: string } {
  switch (command.code) {
    case 'offer': {
      const parts = [
        command.locked ? 'Locked: insufficient Credits.' : '',
        command.forced ? 'Forced; weaker options.' : '',
        command.offerKind === 'encounter' ? `Cost Cr${command.cost}. ${command.risk}` : 'Keystone',
        command.shipTag ? `Ship: ${command.shipTag}.` : '',
        command.crew.length ? `Crew: ${command.crew.join(', ')}.` : '',
      ];
      return {
        text: command.title ?? command.offerId.replaceAll('_', ' '),
        sub: parts.filter(Boolean).join(' '),
      };
    }
    case 'endCycle':
      return {
        text: 'End cycle',
        sub: `${plural(command.actionsLeft, 'action', 'actions')} left. Pay ship upkeep and advance Pursuit.${command.noEligibleOffers ? ' No eligible offers.' : ''}`,
      };
    case 'restart':
      return { text: 'Restart run', sub: 'Pursuit is full and no runnable finale is available.' };
    case 'ship':
      return { text: `${command.selected ? 'Selected: ' : ''}${command.name}`, sub: command.tags.join(', ') };
    case 'crew':
      return { text: `${command.assigned ? 'Unassign' : 'Assign'} ${command.name}`, sub: `${command.skill} assist` };
    case 'confirm':
      return { text: 'Confirm assignment', sub: 'Commit the action and pay the cost.' };
    case 'cancel':
      return {
        text: 'Cancel',
        sub: command.ready
          ? 'Return without spending an action or Credits.'
          : 'Not ready: choose a suitable ship and required crew, and ensure you can pay the cost.',
      };
  }
}

/** Text and hint for a dock button: ink text as written, scheduling commands from codes. */
export function choiceText(choice: UIChoice): { text: string; sub?: string } {
  return choice.command
    ? commandText(choice.command)
    : { text: choice.text, ...(choice.sub ? { sub: choice.sub } : {}) };
}

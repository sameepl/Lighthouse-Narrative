import type { GameData } from '../data/validate';
import type { RunState, UIChoice } from './types';

/** Basic command adapter keeps the current choice dock usable until dedicated Hub/Prepare screens land. */
export function runChoices(run: RunState, data: GameData, resources: Record<string, number>): UIChoice[] {
  const choice = (id: string, text: string, sub?: string): UIChoice => ({ id, kind: 'choice', text, sub });
  if (run.phase === 'hub') {
    const choices = run.offers.map(o =>
      choice(
        `offer:${o.entry.id}`,
        o.kind === 'keystone' ? o.entry.title : o.entry.id.replaceAll('_', ' '),
        `${o.kind === 'encounter' && o.entry.cost > (resources.Credits ?? 0) ? 'Locked: insufficient Credits. ' : ''}${o.forced ? 'Forced; weaker options. ' : ''}${o.kind === 'encounter' ? `Cost Cr${o.entry.cost}. ${o.entry.risk}` : 'Keystone'}${o.entry.requires.shipTag ? ` Ship: ${o.entry.requires.shipTag}.` : ''}${o.entry.requires.crew?.length ? ` Crew: ${o.entry.requires.crew.join(', ')}.` : ''}`,
      ),
    );
    if (run.boardStatus !== 'pursuit-full' && !run.offers.some(o => o.forced))
      choices.push(
        choice(
          'endCycle',
          'End cycle',
          `${run.cycle.actionsLeft} actions left. Pay ship upkeep and advance Pursuit.${run.boardStatus === 'no-eligible-offers' ? ' No eligible offers.' : ''}`,
        ),
      );
    if (run.boardStatus === 'pursuit-full')
      choices.push(choice('restart', 'Restart run', 'Pursuit is full and no runnable finale is available.'));
    return choices;
  }
  if (run.phase !== 'prepare') return [];
  const offer = run.active!,
    req = offer.entry.requires;
  const ship = data.ships.find(s => s.id === run.assignments.shipId);
  const ready =
    ship &&
    (!req.shipTag || ship.tags.includes(req.shipTag)) &&
    (req.crew ?? []).every(id => run.assignments.crewIds.includes(id)) &&
    (offer.kind !== 'encounter' || (resources.Credits ?? 0) >= offer.entry.cost);
  return [
    ...data.ships.map(ship =>
      choice(
        `ship:${ship.id}`,
        `${run.assignments.shipId === ship.id ? 'Selected: ' : ''}${ship.name}`,
        ship.tags.join(', '),
      ),
    ),
    ...data.crew
      .filter(c => !run.busyCrewIds.includes(c.id))
      .map(c =>
        choice(
          `crew:${c.id}`,
          `${run.assignments.crewIds.includes(c.id) ? 'Unassign' : 'Assign'} ${c.name}`,
          `${c.assist.skill} assist`,
        ),
      ),
    ...(ready ? [choice('confirm', 'Confirm assignment', 'Commit the action and pay the cost.')] : []),
    choice(
      'cancel',
      'Cancel',
      ready
        ? 'Return without spending an action or Credits.'
        : 'Not ready: choose a suitable ship and required crew, and ensure you can pay the cost.',
    ),
  ];
}

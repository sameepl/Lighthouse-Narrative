import type { GameData } from '../data/validate';
import { availableCrew } from './crew';
import { confirmationReasons, offerLockReasons } from './view';
import type { Command, RunState, UIChoice } from './types';

/** Scheduling commands for the choice dock. Codes and parameters only: src/ui/strings.ts writes the words. */
export function runChoices(run: RunState, data: GameData, resources: Record<string, number>): UIChoice[] {
  const choice = (id: string, command: Command): UIChoice => ({ id, kind: 'choice', text: '', command });
  if (run.phase === 'hub') {
    const choices = run.offers.map(o =>
      choice(`offer:${o.entry.id}`, {
        code: 'offer',
        offerId: o.entry.id,
        offerKind: o.kind,
        title: o.entry.title,
        ...(o.kind === 'encounter' ? { cost: o.entry.cost, risk: o.entry.risk } : {}),
        locked: offerLockReasons(o, resources).length > 0,
        forced: o.forced,
        ...(o.entry.requires.shipTag ? { shipTag: o.entry.requires.shipTag } : {}),
        crew: o.entry.requires.crew ?? [],
      }),
    );
    if (run.boardStatus !== 'pursuit-full' && !run.offers.some(o => o.forced))
      choices.push(
        choice('endCycle', {
          code: 'endCycle',
          actionsLeft: run.cycle.actionsLeft,
          noEligibleOffers: run.boardStatus === 'no-eligible-offers',
        }),
      );
    if (run.boardStatus === 'pursuit-full') choices.push(choice('restart', { code: 'restart' }));
    return choices;
  }
  if (run.phase !== 'prepare') return [];
  const crew = availableCrew(data, run.busyCrewIds);
  const ready = confirmationReasons(run, data, resources).length === 0;
  return [
    ...data.ships.map(ship =>
      choice(`ship:${ship.id}`, {
        code: 'ship',
        shipId: ship.id,
        name: ship.name,
        tags: ship.tags,
        selected: run.assignments.shipId === ship.id,
      }),
    ),
    ...crew.map(c =>
      choice(`crew:${c.id}`, {
        code: 'crew',
        crewId: c.id,
        name: c.name,
        skill: c.assist.skill,
        assigned: run.assignments.crewIds.includes(c.id),
      }),
    ),
    ...(ready ? [choice('confirm', { code: 'confirm' })] : []),
    choice('cancel', { code: 'cancel', ready: !!ready }),
  ];
}

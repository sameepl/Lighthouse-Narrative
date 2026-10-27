import type { GameData } from '../data/validate';
import { assistOf } from '../engine/cycle';
import { availableCrew } from './crew';
import type { Assignments, GameView, Offer, PreparationReason, RunState } from './types';

export function assignmentReasons(value: Assignments, run: RunState, data: GameData): PreparationReason[] {
  const reasons: PreparationReason[] = [];
  if (value.shipId !== null && !data.ships.some(s => s.id === value.shipId))
    reasons.push({ code: 'unknownShip', shipId: value.shipId });
  if (new Set(value.crewIds).size !== value.crewIds.length) reasons.push({ code: 'duplicateCrew' });
  const crew = availableCrew(data, run.busyCrewIds);
  for (const crewId of value.crewIds)
    if (!crew.some(c => c.id === crewId)) reasons.push({ code: 'unavailableCrew', crewId });
  return reasons;
}

/** Board locks preserve the existing affordability policy, independent of prepare assignments. */
export function offerLockReasons(offer: Offer, resources: Record<string, number>): PreparationReason[] {
  return offer.kind === 'encounter' && offer.entry.cost > (resources.Credits ?? 0)
    ? [{ code: 'insufficientCredits', required: offer.entry.cost, available: resources.Credits ?? 0 }]
    : [];
}

/** Same ordered checks used by real confirmation; no state changes or approach prediction. */
export function confirmationReasons(
  run: RunState,
  data: GameData,
  resources: Record<string, number>,
): PreparationReason[] {
  const reasons = assignmentReasons(run.assignments, run, data);
  const req = run.active!.entry.requires;
  const ship = data.ships.find(s => s.id === run.assignments.shipId);
  if (req.shipTag && !ship) reasons.push({ code: 'requiredShip', shipTag: req.shipTag });
  else if (req.shipTag && ship && !ship.tags.includes(req.shipTag))
    reasons.push({ code: 'unsuitableShip', shipId: ship.id, shipTag: req.shipTag });
  for (const crewId of req.crew ?? [])
    if (!run.assignments.crewIds.includes(crewId)) reasons.push({ code: 'requiredCrew', crewId });
  reasons.push(...offerLockReasons(run.active!, resources));
  if (run.cycle.actionsLeft <= 0) reasons.push({ code: 'noActionsLeft' });
  return reasons;
}

/** Only legacy validation errors use prose; projected reasons always carry codes and parameters. */
export function preparationError(reason: PreparationReason): string {
  switch (reason.code) {
    case 'unknownShip':
      return 'Unknown ship';
    case 'duplicateCrew':
      return 'Duplicate crew assignment';
    case 'unavailableCrew':
      return `Crew unavailable: ${reason.crewId}`;
    case 'requiredShip':
    case 'unsuitableShip':
      return 'Assign a suitable ship';
    case 'requiredCrew':
      return 'Assign the required crew';
    case 'insufficientCredits':
      return 'Insufficient Credits';
    case 'noActionsLeft':
      return 'No actions left';
  }
}

/** Detached preparation facts; assistOf owns the skill bonus and no approach has been selected. */
export function preparationProjection(run: RunState, data: GameData, resources: Record<string, number>) {
  const reasons = run.phase === 'prepare' ? confirmationReasons(run, data, resources) : [];
  const tag = run.active?.entry.requires.shipTag;
  const projection: Pick<GameView, 'active' | 'offerLocks' | 'preparation'> = {
    active: run.active ? structuredClone(run.active) : null,
    offerLocks: run.offers.map(o => ({ offerId: o.entry.id, reasons: offerLockReasons(o, resources) })),
    preparation:
      run.phase !== 'prepare'
        ? null
        : {
            ready: reasons.length === 0,
            reasons,
            shipRequirement: tag ? { kind: 'required', tag } : { kind: 'optional' },
            crew: data.crew.map(c => ({
              crewId: c.id,
              name: c.name,
              trait: c.trait,
              assignable: c.assignable,
              assist: assistOf(c, run.crewTrust[c.id]!, data.rules),
              trust: run.crewTrust[c.id]!,
              busy: run.busyCrewIds.includes(c.id),
              assigned: run.assignments.crewIds.includes(c.id),
            })),
            ships: data.ships.map(s => ({
              shipId: s.id,
              name: s.name,
              tags: [...s.tags],
              upkeep: s.upkeep,
              selected: run.assignments.shipId === s.id,
            })),
          },
  };
  return projection;
}

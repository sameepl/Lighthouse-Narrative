import type { Crew, Keystone, Ships } from '../data/schema';
import type { CycleState } from './types';

/** The caller supplies season roles and the evidence threshold; this module invents no story IDs. */
export interface KeystoneRoles {
  firstId: string;
  middleIds: readonly string[];
  conditionalId?: string;
  finaleId: string;
  minCompletedMiddle: number;
}

export interface KeystoneInput {
  cycle: CycleState;
  resources: Readonly<Record<string, number>>;
  ships: readonly Ships[number][];
  crew: readonly Crew[number][];
  gear: readonly string[];
  flags: Readonly<Record<string, boolean>>;
  leads: readonly string[];
  completed: readonly string[];
  keystones: readonly Keystone[];
  roles: KeystoneRoles;
}

export interface KeystoneSchedule {
  offers: { keystone: Keystone; forced: boolean; weak: boolean }[];
  pieces: Exclude<Keystone['piece'], 'none'>[];
  /** A deadline cannot silently waive missing assets, flags, or the finale evidence threshold. */
  blockedDue: string[];
  commercialReplacement: boolean;
  ended: boolean;
}

/** Pure scheduling only: choosing/completing a scene and applying its consequences belong to the caller. */
export function scheduleKeystones(input: KeystoneInput): KeystoneSchedule {
  const { roles, cycle } = input;
  const ids = input.keystones.map(entry => entry.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate keystone IDs');
  const roleIds = [roles.firstId, ...roles.middleIds, roles.finaleId];
  if (new Set(roleIds).size !== roleIds.length) throw new Error('Keystone roles must have distinct IDs');
  for (const id of [...roleIds, ...input.completed, ...input.leads])
    if (!ids.includes(id)) throw new Error(`Unknown keystone "${id}". Known: ${ids.join(', ')}`);
  if (roles.conditionalId !== undefined && !roles.middleIds.includes(roles.conditionalId))
    throw new Error('Conditional keystone must be a middle role');
  if (
    !Number.isInteger(roles.minCompletedMiddle) ||
    roles.minCompletedMiddle < 0 ||
    roles.minCompletedMiddle > roles.middleIds.length
  )
    throw new Error('Invalid middle completion threshold');
  if (
    !Number.isInteger(cycle.cycle) ||
    cycle.cycle < 1 ||
    !Number.isInteger(cycle.pursuit.length) ||
    cycle.pursuit.length < 1 ||
    !Number.isInteger(cycle.pursuit.value) ||
    cycle.pursuit.value < 0 ||
    cycle.pursuit.value > cycle.pursuit.length
  )
    throw new Error('Invalid cycle or Pursuit clock');

  const catalog = new Map(input.keystones.map(entry => [entry.id, entry]));
  const completed = new Set(input.completed);
  const middle = roles.middleIds.map(id => catalog.get(id)!);
  const completedMiddle = middle.filter(entry => completed.has(entry.id));
  const pieces = (['where', 'who', 'why'] as const).filter(piece =>
    completedMiddle.some(entry => entry.piece === piece),
  );
  const result: KeystoneSchedule = {
    offers: [],
    pieces,
    blockedDue: [],
    commercialReplacement: false,
    ended: completed.has(roles.finaleId),
  };
  if (result.ended) return result;

  const requirementsMet = (entry: Keystone): boolean => {
    const req = entry.requires;
    return (
      (req.minCredits === undefined || (input.resources.Credits ?? 0) >= req.minCredits) &&
      (req.shipTag === undefined || input.ships.some(ship => ship.tags.includes(req.shipTag!))) &&
      (req.crew ?? []).every(id => input.crew.some(member => member.id === id)) &&
      (req.gear ?? []).every(tag => input.gear.includes(tag)) &&
      (req.flags ?? []).every(flag => input.flags[flag] === true) &&
      (req.cycle?.min === undefined || cycle.cycle >= req.cycle.min) &&
      (req.cycle?.max === undefined || cycle.cycle <= req.cycle.max)
    );
  };
  const offer = (entry: Keystone, force = false, evidenceMet = true) => {
    if (completed.has(entry.id)) return;
    const due = force || cycle.cycle >= entry.deadline;
    const available =
      (entry.availableWhen.lead !== undefined && input.leads.includes(entry.availableWhen.lead)) ||
      (entry.availableWhen.cycle !== undefined && cycle.cycle >= entry.availableWhen.cycle);
    if (!due && !available) return;
    if (!requirementsMet(entry) || !evidenceMet) {
      if (due) result.blockedDue.push(entry.id);
      if (entry.id === roles.conditionalId) result.commercialReplacement = true;
      return;
    }
    result.offers.push({ keystone: entry, forced: due, weak: due });
  };

  // Opening always precedes the rest, including a clock already full in a restored state.
  if (!completed.has(roles.firstId)) {
    offer(catalog.get(roles.firstId)!);
    return result;
  }
  // Full Pursuit explicitly bypasses the finale's evidence/availability gates, not hard requirements.
  if (cycle.pursuit.value === cycle.pursuit.length) {
    offer(catalog.get(roles.finaleId)!, true);
    return result;
  }
  for (const entry of [...middle].sort((a, b) => a.deadline - b.deadline || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)))
    offer(entry);
  offer(catalog.get(roles.finaleId)!, false, completedMiddle.length >= roles.minCompletedMiddle);
  return result;
}

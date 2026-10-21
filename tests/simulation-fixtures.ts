import type { Encounter, Keystone } from '../src/data/schema';
import type { KeystoneRoles } from '../src/engine/keystones';

// Test-only catalog: the current production catalog has one once-only encounter and no keystones.
const encounter = (id: string, layer: Encounter['layer'], change: Partial<Encounter> = {}): Encounter => ({
  id,
  knot: 'written_clause',
  layer,
  archetype: layer === 'crisis' ? 'standoff' : 'courier',
  tags: [],
  requires: {},
  repeat: { kind: 'once' },
  weight: 1,
  cost: 0,
  risk: 'Simulation fixture',
  placeholder: true,
  ...change,
});

export const simulationEncounters: Encounter[] = [
  encounter('first_crisis', 'crisis'),
  encounter('recovery', 'crisis', { repeat: { kind: 'repeatable', cooldown: 0 } }),
  encounter('lead_where', 'commercial', { lead: 'middle_where', requires: { shipTag: 'quiet' } }),
  encounter('lead_who', 'commercial', { lead: 'middle_who', requires: { crew: ['priya'] } }),
  encounter('routine', 'commercial', { repeat: { kind: 'repeatable', cooldown: 0 }, weight: 3 }),
  encounter('stretch', 'commercial', { cost: 60000 }),
  encounter('gated', 'commercial', {
    cost: 1000,
    requires: { minCredits: 1000, shipTag: 'quiet', gear: ['probe'], crew: ['priya'], flags: ['aid'] },
    repeat: { kind: 'repeatable', cooldown: 1 },
  }),
];

const keystone = (id: string, change: Partial<Keystone>): Keystone => ({
  id,
  knot: 'written_clause',
  title: 'Simulation fixture',
  elevates: 'courier',
  availableWhen: { cycle: 1 },
  deadline: 9,
  piece: 'none',
  requires: {},
  placeholder: true,
  ...change,
});

export const simulationKeystones: Keystone[] = [
  keystone('opening', { availableWhen: { cycle: 1 }, deadline: 2 }),
  keystone('middle_where', { availableWhen: { lead: 'middle_where', cycle: 3 }, deadline: 4, piece: 'removed' }),
  keystone('middle_who', { availableWhen: { lead: 'middle_who', cycle: 4 }, deadline: 5, piece: 'six' }),
  keystone('middle_why', {
    availableWhen: { cycle: 5 },
    deadline: 6,
    piece: 'claim',
    requires: { flags: ['aid'] },
  }),
  keystone('finale', { availableWhen: { cycle: 8 }, deadline: 9 }),
];

export const simulationRoles: KeystoneRoles = {
  firstId: 'opening',
  middleIds: ['middle_where', 'middle_who', 'middle_why'],
  conditionalId: 'middle_why',
  finaleId: 'finale',
  minCompletedMiddle: 2,
};

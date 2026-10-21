import type { GameData } from '../data/validate';
import { createSeededRng } from '../engine/rng';
import type { SaveData } from './types';

/** Reject broken persisted state before applying any part of it; caller can start fresh. */
export function validateSave(save: SaveData, data: GameData): void {
  const fail = () => {
    throw new Error('Invalid version 2 save');
  };
  if (
    save.v !== 2 ||
    typeof save.ink !== 'string' ||
    typeof save.bg !== 'string' ||
    !save.res ||
    !Array.isArray(save.ledger) ||
    !Array.isArray(save.events) ||
    !save.run
  )
    fail();
  const s = save.run,
    c = s.cycle;
  if (
    !['hub', 'prepare', 'scene', 'ended'].includes(s.phase) ||
    !c ||
    !c.pursuit ||
    !Number.isInteger(c.cycle) ||
    c.cycle < 1 ||
    !Number.isInteger(c.actionsLeft) ||
    c.actionsLeft < 0 ||
    c.actionsLeft > data.rules.cycle.actions ||
    !Number.isInteger(c.pursuit.length) ||
    c.pursuit.length < 1 ||
    !Number.isInteger(c.pursuit.value) ||
    c.pursuit.value < 0 ||
    c.pursuit.value > c.pursuit.length ||
    !Array.isArray(c.edgeEarnedCrewIds) ||
    !Array.isArray(s.played) ||
    !Array.isArray(s.completed) ||
    !Array.isArray(s.leads) ||
    !Array.isArray(s.offers) ||
    (s.encounterBoard !== null && !Array.isArray(s.encounterBoard)) ||
    !Array.isArray(s.busyCrewIds) ||
    !s.assignments ||
    !Array.isArray(s.assignments.crewIds)
  )
    fail();
  createSeededRng(s.rngState);
  for (const [name, definition] of Object.entries(data.rules.resources)) {
    const value = save.res[name];
    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < definition.min ||
      value > (definition.max ?? Infinity)
    )
      fail();
  }
  const ids = new Set([...data.encounters, ...data.keystones].map(entry => entry.id));
  for (const offer of [...s.offers, ...(s.active ? [s.active] : [])])
    if (!offer?.entry || !ids.has(offer.entry.id)) fail();
  for (const entry of s.encounterBoard ?? [])
    if (!entry || !data.encounters.some(value => value.id === entry.id)) fail();
  if ((s.phase === 'scene' || s.phase === 'prepare') !== Boolean(s.active)) fail();
  if (s.assignments.shipId !== null && !data.ships.some(ship => ship.id === s.assignments.shipId)) fail();
  for (const id of [...s.busyCrewIds, ...s.assignments.crewIds, ...c.edgeEarnedCrewIds])
    if (!data.crew.some(member => member.id === id)) fail();
  for (const play of s.played)
    if (
      !data.encounters.some(entry => entry.id === play.id) ||
      !Number.isInteger(play.cycle) ||
      play.cycle < 1 ||
      play.cycle > c.cycle
    )
      fail();
}

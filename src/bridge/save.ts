import type { GameData } from '../data/validate';
import { createSeededRng } from '../engine/rng';
import type { LegacySaveData, SaveData } from './types';

/** Reject broken persisted state before applying any part of it; caller can start fresh. */
export function validateSave(save: SaveData | LegacySaveData, data: GameData): void {
  const fail = () => {
    throw new Error(`Invalid version ${save.v} save`);
  };
  if (
    (save.v !== 3 && save.v !== 4) ||
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
  if (save.v === 4) {
    const { arrears, upkeepShortfall, failed } = save.run.cycle;
    const limit = data.rules.cycle.upkeep.arrearsLimit;
    if (
      !Number.isSafeInteger(arrears) ||
      arrears < 0 ||
      arrears > limit ||
      !Number.isSafeInteger(upkeepShortfall) ||
      upkeepShortfall < 0 ||
      typeof failed !== 'boolean' ||
      failed !== (arrears === limit) ||
      ![null, 'foreclosure'].includes(save.run.ending) ||
      (save.run.ending === 'foreclosure' && !failed) ||
      (failed && !((save.run.phase === 'scene' && save.run.ending === 'foreclosure') || save.run.phase === 'ended')) ||
      (failed && (s.active !== null || s.offers.length !== 0 || s.boardStatus !== 'ended'))
    )
      fail();
  }
  const trust = s.crewTrust;
  if (
    !trust ||
    typeof trust !== 'object' ||
    Array.isArray(trust) ||
    Object.keys(trust).length !== data.crew.length ||
    data.crew.some(
      ({ id }) => !Object.hasOwn(trust, id) || !Number.isInteger(trust[id]) || trust[id]! < 0 || trust[id]! > 3,
    )
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
  const hasTitle = (entry: { title: unknown }) => typeof entry.title === 'string' && entry.title.length > 0;
  for (const offer of [...s.offers, ...(s.active ? [s.active] : [])])
    if (!offer?.entry || !ids.has(offer.entry.id) || !hasTitle(offer.entry)) fail();
  for (const entry of s.encounterBoard ?? [])
    if (!entry || !data.encounters.some(value => value.id === entry.id) || !hasTitle(entry)) fail();
  const endingScene = save.v === 4 && save.run.ending === 'foreclosure' && s.phase === 'scene';
  if ((s.phase === 'prepare' || (s.phase === 'scene' && !endingScene)) !== Boolean(s.active)) fail();
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

/** Validate the entire legacy payload before adding defaults to a detached copy. */
export function migrateSave(save: SaveData | LegacySaveData, data: GameData): SaveData {
  validateSave(save, data);
  const copy = structuredClone(save);
  if (copy.v === 4) {
    // Previously shipped v4 saves kept the marker after the terminal run ended.
    if (copy.run.phase === 'ended' && copy.run.cycle.failed) copy.run.ending = null;
    return copy;
  }
  return {
    ...copy,
    v: 4,
    run: { ...copy.run, ending: null, cycle: { ...copy.run.cycle, arrears: 0, upkeepShortfall: 0, failed: false } },
  };
}

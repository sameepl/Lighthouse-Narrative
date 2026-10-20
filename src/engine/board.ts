import type { Crew, Encounter, Ships } from '../data/schema';
import type { SeededRng } from './rng';

export interface BoardInput {
  cycle: number;
  resources: Readonly<Record<string, number>>;
  ships: readonly Ships[number][];
  crew: readonly Crew[number][];
  gear: readonly string[];
  flags: Readonly<Record<string, boolean>>;
  played: readonly { id: string; cycle: number }[];
  encounters: readonly Encounter[];
  /** Keystone ID whose lead should appear if an eligible producer exists. */
  dueLead?: string;
  /** Used only when the catalog has no eligible offers. */
  fallback?: Encounter;
}

export interface BoardResult {
  offers: Encounter[];
  status: 'ready' | 'no-eligible-offers';
  unmetGuarantees: string[];
}

function eligible(entry: Encounter, input: BoardInput): boolean {
  const req = entry.requires;
  const credits = input.resources.Credits ?? 0;
  if (req.minCredits !== undefined && credits < req.minCredits) return false;
  const shipTag = req.shipTag;
  if (shipTag && !input.ships.some(ship => ship.tags.includes(shipTag))) return false;
  if (req.gear?.some(tag => !input.gear.includes(tag))) return false;
  if (req.crew?.some(id => !input.crew.some(member => member.id === id))) return false;
  if (req.flags?.some(flag => input.flags[flag] !== true)) return false;
  if (req.cycle?.min !== undefined && input.cycle < req.cycle.min) return false;
  if (req.cycle?.max !== undefined && input.cycle > req.cycle.max) return false;

  const plays = input.played.filter(play => play.id === entry.id);
  if (entry.repeat.kind === 'once') return plays.length === 0;
  const last = plays.reduce((latest, play) => Math.max(latest, play.cycle), -Infinity);
  return input.cycle - last > entry.repeat.cooldown;
}

function weightedPick(entries: readonly Encounter[], rng: Pick<SeededRng, 'next'>): Encounter | undefined {
  if (entries.length === 0) return undefined;
  const ordered = [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const draw = rng.next();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new Error('RNG draw must be finite in [0, 1)');
  const maxWeight = ordered.reduce((max, entry) => Math.max(max, entry.weight), 0);
  if (!Number.isFinite(maxWeight) || maxWeight <= 0) throw new Error('Encounter weights must be finite and positive');
  const total = ordered.reduce((sum, entry) => sum + entry.weight / maxWeight, 0);
  let position = draw * total;
  for (const entry of ordered) {
    position -= entry.weight / maxWeight;
    if (position < 0) return entry;
  }
  return ordered[ordered.length - 1];
}

/** Select eligible offers without replacement, preserving hard requirements and repeat rules. */
export function buildBoard(input: BoardInput, rng: Pick<SeededRng, 'next'>): BoardResult {
  if (!Number.isInteger(input.cycle) || input.cycle < 1) throw new Error('Board cycle must be a positive integer');
  if (!Number.isFinite(input.resources.Credits ?? 0)) throw new Error('Credits must be finite');
  const ids = input.encounters.map(entry => entry.id);
  if (new Set(ids).size !== ids.length) throw new Error('Encounter ids must be unique');
  const catalog = input.encounters.filter(entry => eligible(entry, input));
  const pool = catalog.length
    ? catalog
    : input.fallback && !ids.includes(input.fallback.id) && eligible(input.fallback, input)
      ? [input.fallback]
      : [];
  const chosen: Encounter[] = [];
  const remaining = (predicate: (entry: Encounter) => boolean) =>
    pool.filter(entry => !chosen.some(selected => selected.id === entry.id) && predicate(entry));
  const take = (predicate: (entry: Encounter) => boolean) => {
    const entry = weightedPick(remaining(predicate), rng);
    if (entry) chosen.push(entry);
  };

  if (input.dueLead) take(entry => entry.lead === input.dueLead);
  if (!chosen.some(entry => entry.layer === 'crisis')) take(entry => entry.layer === 'crisis');

  const commercial = () => chosen.filter(entry => entry.layer === 'commercial');
  const credits = input.resources.Credits ?? 0;
  if (!commercial().some(entry => entry.cost <= credits))
    take(entry => entry.layer === 'commercial' && entry.cost <= credits);
  if (!commercial().some(entry => entry.cost > credits))
    take(entry => entry.layer === 'commercial' && entry.cost > credits);
  while (commercial().length < 3 && remaining(entry => entry.layer === 'commercial').length)
    take(entry => entry.layer === 'commercial');

  const offers = [
    ...chosen.filter(entry => entry.layer === 'crisis'),
    ...chosen.filter(entry => entry.layer === 'commercial'),
  ];
  const unmetGuarantees: string[] = [];
  if (!offers.some(entry => entry.layer === 'crisis')) unmetGuarantees.push('crisis');
  if (commercial().length < 2) unmetGuarantees.push('commercial');
  if (!commercial().some(entry => entry.cost <= credits)) unmetGuarantees.push('affordable');
  if (!commercial().some(entry => entry.cost > credits)) unmetGuarantees.push('stretch');
  if (input.dueLead && !offers.some(entry => entry.lead === input.dueLead)) unmetGuarantees.push('dueLead');
  return { offers, status: offers.length ? 'ready' : 'no-eligible-offers', unmetGuarantees };
}

import type { Rules, Ships } from '../data/schema';
import type { RollPart } from './types';

export type ShipRollPart = RollPart & { ship: { tag: Ships[number]['tags'][number] } };

/** Only the assigned ship and matching skill contribute; repeated tags never stack. */
export function shipModifiers(ship: Ships[number] | undefined, skill: string, rules: Rules): ShipRollPart[] {
  if (!Object.hasOwn(rules.skillChar, skill))
    throw new Error(`Unknown skill "${skill}". Known: ${Object.keys(rules.skillChar).join(', ')}`);
  return rules.shipModifiers
    .filter(entry => ship?.tags.includes(entry.tag) && entry.skills.includes(skill))
    .map(entry => ({ label: entry.tag, n: entry.n, ship: { tag: entry.tag } }));
}

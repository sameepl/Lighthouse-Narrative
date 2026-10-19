// Validation of the data files. Used by the tests and, in dev only, on startup; never shipped to players.
import { z } from 'zod';
import { CharacterSchema, CrewSchema, RulesSchema, ShipsSchema } from './schema';
import type { Character, Crew, Rules, Ships } from './schema';

export interface GameData {
  rules: Rules;
  character: Character;
  crew: Crew;
  ships: Ships;
}

/** Parses and cross-checks all data files. Throws with a message naming the bad field. */
export function parseData(raw: { rules: unknown; character: unknown; crew: unknown; ships: unknown }): GameData {
  const rules = RulesSchema.parse(raw.rules);
  const character = CharacterSchema.parse(raw.character);
  const crew = CrewSchema.parse(raw.crew);
  const ships = ShipsSchema.parse(raw.ships);
  const unknown = Object.keys(character.skills).filter(s => !(s in rules.skillChar));
  if (unknown.length) {
    throw new z.ZodError([
      {
        code: 'custom',
        path: ['character', 'skills'],
        message: `skills with no characteristic in rules.skillChar: ${unknown.join(', ')}`,
        input: unknown,
      },
    ]);
  }
  for (const need of ['Credits', 'Edge', 'Strain']) {
    if (!(need in rules.resources)) throw new Error(`rules.resources is missing "${need}"`);
  }
  const ids = crew.map(c => c.id);
  if (new Set(ids).size !== ids.length) throw new Error('crew.json has duplicate ids');
  return { rules, character, crew, ships };
}

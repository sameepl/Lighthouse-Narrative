import rulesJson from './rules.json';
import characterJson from './character.json';
import crewJson from './crew.json';
import shipsJson from './ships.json';
import seasonJson from './season.json';
import type { GameData } from './validate';

export const encounterFiles = import.meta.glob('./encounters/*.json', { eager: true, import: 'default' });
export const keystoneFiles = import.meta.glob('./keystones/*.json', { eager: true, import: 'default' });
const raw = {
  rules: rulesJson,
  character: characterJson,
  crew: crewJson,
  ships: shipsJson,
  season: seasonJson,
  encounters: encounterFiles,
  keystones: keystoneFiles,
};

/** The game's data. The schemas have no defaults or transforms, so the raw JSON is exactly what parsing returns. */
const values = (files: Record<string, unknown>) =>
  Object.keys(files)
    .sort()
    .map(file => files[file]);
export const data = {
  ...raw,
  encounters: values(encounterFiles),
  keystones: values(keystoneFiles),
} as unknown as GameData;

// Validate in dev so a bad edit is loud right away. Production never loads zod; CI validates via `npm test`.
if (import.meta.env.DEV) {
  void import('./validate')
    .then(m => m.parseData(raw))
    .catch((err: unknown) => {
      setTimeout(() => {
        throw err;
      }); // surfaces in the Vite error overlay and the console
    });
}

export type { GameData } from './validate';
export type { Rules, Character, Crew, Ships, Encounter, Keystone, Season } from './schema';

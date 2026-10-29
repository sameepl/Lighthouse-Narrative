// Validation of the data files. Used by the tests and, in dev only, on startup; never shipped to players.
import { z } from 'zod';
import {
  CharacterSchema,
  CrewSchema,
  RulesSchema,
  ShipsSchema,
  EncounterSchema,
  KeystoneSchema,
  SeasonSchema,
} from './schema';
import type { Character, Crew, Rules, Ships, Encounter, Keystone, Season } from './schema';

export interface GameData {
  rules: Rules;
  character: Character;
  crew: Crew;
  ships: Ships;
  encounters: Encounter[];
  keystones: Keystone[];
  season: Season;
}

/** Parses and cross-checks all data files. Throws with a message naming the bad field. */
export function parseData(raw: {
  rules: unknown;
  character: unknown;
  crew: unknown;
  ships: unknown;
  season: unknown;
  encounters?: Record<string, unknown>;
  keystones?: Record<string, unknown>;
}): GameData {
  const rules = RulesSchema.parse(raw.rules);
  const character = CharacterSchema.parse(raw.character);
  const parsedCrew = CrewSchema.safeParse(raw.crew);
  if (!parsedCrew.success)
    throw new Error(
      parsedCrew.error.issues
        .map(issue => {
          const entry = Array.isArray(raw.crew) ? raw.crew[Number(issue.path[0])] : undefined;
          return `crew.json ${entry?.id ?? issue.path[0] ?? 'catalog'}: ${issue.path.slice(1).join('.')}: ${issue.message}`;
        })
        .join('\n'),
    );
  const crew = parsedCrew.data;
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
  for (const need of ['Credits', 'Edge', 'Strain', 'Renown']) {
    if (!(need in rules.resources)) throw new Error(`rules.resources is missing "${need}"`);
  }
  for (const member of crew) {
    if (!(member.assist.skill in rules.skillChar))
      throw new Error(`crew.json ${member.id} assist.skill "${member.assist.skill}" is not in rules.skillChar`);
  }
  const ids = crew.map(c => c.id);
  if (new Set(ids).size !== ids.length) throw new Error('crew.json has duplicate ids');
  const shipIds = ships.map(s => s.id);
  if (new Set(shipIds).size !== shipIds.length) throw new Error('ships.json has duplicate ids');
  const content = parseContent(raw.encounters ?? {}, raw.keystones ?? {}, {
    shipTags: ships.flatMap(ship => ship.tags),
    crewIds: crew.filter(member => member.assignable).map(member => member.id),
  });
  const season = parseSeason(raw.season, content.keystones);
  return { rules, character, crew, ships, ...content, season };
}

/** Optional ink references are supplied by content tests, not by the production loader. */
export interface ContentReferences {
  shipTags: readonly string[];
  /** IDs permitted in operational requirements, excluding non-assignable catalog members. */
  crewIds: readonly string[];
  flagExists?: (flag: string) => boolean;
  knotExists?: (knot: string) => boolean;
}

export function parseContent(
  encounters: Record<string, unknown>,
  keystones: Record<string, unknown>,
  refs: ContentReferences,
): { encounters: Encounter[]; keystones: Keystone[] } {
  const read = <T>(files: Record<string, unknown>, schema: z.ZodType<T>) =>
    Object.entries(files)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([file, value]) => {
        const result = schema.safeParse(value);
        if (!result.success) throw new Error(`${file}: ${result.error.message}`);
        return { file, value: result.data };
      });
  const es = read(encounters, EncounterSchema),
    ks = read(keystones, KeystoneSchema);
  const all = [...es, ...ks];
  const ids = new Set<string>();
  const leads = new Set(ks.map(entry => entry.value.id));
  const known = (file: string, field: string, value: string, values: readonly string[] | Set<string>) => {
    if (!(values instanceof Set ? values.has(value) : values.includes(value)))
      throw new Error(`${file}: ${field}: unknown reference "${value}"`);
  };
  for (const { file, value } of all) {
    if (ids.has(value.id)) throw new Error(`${file}: id: duplicate "${value.id}"`);
    ids.add(value.id);
    if (file.split(/[\\/]/).pop() !== `${value.id}.json`) throw new Error(`${file}: id: must match filename`);
    if (refs.knotExists && !refs.knotExists(value.knot)) throw new Error(`${file}: knot: unknown "${value.knot}"`);
    const req = value.requires;
    if (req.shipTag) known(file, 'requires.shipTag', req.shipTag, refs.shipTags);
    for (const [index, id] of (req.crew ?? []).entries()) known(file, `requires.crew.${index}`, id, refs.crewIds);
    for (const [index, flag] of (req.flags ?? []).entries())
      if (refs.flagExists && !refs.flagExists(flag))
        throw new Error(`${file}: requires.flags.${index}: unknown "${flag}"`);
  }
  for (const { file, value } of es) if (value.lead) known(file, 'lead', value.lead, leads);
  for (const { file, value } of ks)
    if (value.availableWhen.lead) known(file, 'availableWhen.lead', value.availableWhen.lead, leads);
  return { encounters: es.map(entry => entry.value), keystones: ks.map(entry => entry.value) };
}

/** Season activation is atomic: configured roles must all resolve in the same catalog. */
export function parseSeason(raw: unknown, keystones: readonly Keystone[]): Season {
  const result = SeasonSchema.safeParse(raw);
  if (!result.success) throw new Error(`season.json: ${result.error.message}`);
  const season = result.data;
  if (season.status === 'unconfigured') return season;
  const fail = (field: string, message: string): never => {
    throw new Error(`season.json: ${field}: ${message}`);
  };
  const known = new Set(keystones.map(key => key.id));
  for (const mode of ['slice', 'full'] as const) {
    const roles = season[mode];
    const ids = [roles.firstId, ...roles.middleIds, roles.finaleId];
    if (new Set(ids).size !== ids.length) fail(mode, 'duplicate keystone roles');
    for (const [field, id] of [
      ['firstId', roles.firstId],
      ['finaleId', roles.finaleId],
      ...roles.middleIds.map((id, index) => [`middleIds.${index}`, id]),
    ] as [string, string][])
      if (!known.has(id)) fail(`${mode}.${field}`, `unknown keystone "${id}"`);
  }
  if (!season.full.middleIds.includes(season.full.conditionalId)) fail('full.conditionalId', 'must name a middle role');
  if (season.slice.firstId !== season.full.firstId) fail('full.firstId', 'must match slice.firstId');
  if (season.slice.finaleId !== season.full.finaleId) fail('full.finaleId', 'must match slice.finaleId');
  if (season.slice.middleIds.some(id => !season.full.middleIds.includes(id) || id === season.full.conditionalId))
    fail('full.middleIds', 'must contain the slice middles plus a separate conditional middle');
  if (season.pursuitFull === 'hardenFinale') {
    const roles = season.slice;
    for (const id of [roles.firstId, ...roles.middleIds, roles.finaleId]) {
      const key = keystones.find(entry => entry.id === id)!;
      const field = `slice.${id}`;
      if (Object.keys(key.requires).length) fail(`${field}.requires`, 'hardened slice roles need empty requirements');
      if (id === roles.finaleId) {
        if (key.availableWhen.cycle !== 4 || key.availableWhen.lead !== undefined)
          fail(`${field}.availableWhen`, 'hardened slice finale must open only at cycle 4');
        if (key.deadline !== 4) fail(`${field}.deadline`, 'hardened slice finale must be due at cycle 4');
      } else if (key.deadline > (id === roles.firstId ? 1 : 3)) {
        fail(`${field}.deadline`, `hardened slice role must be due by cycle ${id === roles.firstId ? 1 : 3}`);
      }
    }
  }
  return season;
}

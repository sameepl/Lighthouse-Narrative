import { describe, expect, it } from 'vitest';
import { Story } from 'inkjs';
import inkJson from '../src/story/main.ink';
import { data, encounterFiles, keystoneFiles } from '../src/data';
import { parseContent, parseData } from '../src/data/validate';
import { checkZones, type ZoneConfig } from '../scripts/zone-check.mjs';
import { readFileSync } from 'node:fs';

const variables = new Story(inkJson).variablesState;
const refs = {
  shipTags: data.ships.flatMap(ship => ship.tags),
  crewIds: data.crew.map(member => member.id),
  flagExists: (flag: string) => variables.GlobalVariableExistsWithName(flag) && typeof variables.$(flag) === 'boolean',
  knotExists: (knot: string) => {
    const story = new Story(inkJson);
    const errors: string[] = [];
    story.onError = message => errors.push(message);
    try {
      story.ChoosePathString(knot);
    } catch {
      return false;
    }
    return errors.length === 0;
  },
};
const encounter = data.encounters[0]!;
const file = './encounters/written_clause.json';
const keystone = {
  id: 'test_keystone',
  knot: 'written_clause',
  title: 'Test fixture',
  elevates: 'standoff',
  availableWhen: { cycle: 1 },
  deadline: 3,
  piece: 'none',
  requires: {},
};
const keyFile = './keystones/test_keystone.json';
const parse = (value: unknown, keys: Record<string, unknown> = {}) => parseContent({ [file]: value }, keys, refs);

describe('storylet catalogs', () => {
  it('loads real JSON unchanged and validates every entry against compiled ink', () => {
    const parsed = parseContent(encounterFiles, keystoneFiles, refs);
    expect(parsed.encounters).toEqual(data.encounters);
    expect(parsed.keystones).toEqual(data.keystones);
    expect(encounter).toMatchObject({ id: 'written_clause', layer: 'crisis', archetype: 'standoff' });
    const loaded = parseData({ ...data, encounters: encounterFiles, keystones: keystoneFiles });
    expect(loaded.encounters).toEqual(data.encounters);
    expect(refs.flagExists('priya_read')).toBe(true);
    expect(refs.knotExists('missing_knot')).toBe(false);
  });

  it('accepts complete requirements and lead/cycle availability without transforming them', () => {
    const value = {
      ...encounter,
      lead: 'test_keystone',
      repeat: { kind: 'repeatable', cooldown: 0 },
      requires: {
        minCredits: 0,
        shipTag: 'quiet',
        gear: ['probe'],
        crew: ['priya'],
        flags: ['priya_read'],
        cycle: { min: 1, max: 3 },
      },
    };
    const key = { ...keystone, availableWhen: { lead: 'test_keystone', cycle: 1 } };
    expect(parse(value, { [keyFile]: key })).toEqual({ encounters: [value], keystones: [key] });
    expect(parseContent({}, {}, refs)).toEqual({ encounters: [], keystones: [] });
  });

  it.each(['removed', 'six', 'claim', 'none'])('accepts piece %s without transforming it', piece => {
    const key = { ...keystone, piece };
    expect(parse(encounter, { [keyFile]: key }).keystones).toEqual([key]);
  });

  it.each([
    [{ ...encounter, cost: -1 }, 'cost'],
    [{ ...encounter, weight: 0 }, 'weight'],
    [{ ...encounter, id: 'Bad ID' }, 'id'],
    [{ ...encounter, repeat: { kind: 'repeatable', cooldown: -1 } }, 'cooldown'],
    [{ ...encounter, repeat: { kind: 'repeatable' } }, 'cooldown'],
    [{ ...encounter, requires: { cycle: { min: 3, max: 1 } } }, 'cycle'],
    [{ ...encounter, requires: { crew: ['missing'] } }, 'requires.crew.0'],
    [{ ...encounter, requires: { shipTag: 'missing' } }, 'requires.shipTag'],
    [{ ...encounter, requires: { flags: ['missing'] } }, 'requires.flags.0'],
    [{ ...encounter, knot: 'missing_knot' }, 'knot'],
    [{ ...encounter, lead: 'missing' }, 'lead'],
    [{ ...encounter, extra: true }, 'extra'],
    [{ ...encounter, requires: { typo: true } }, 'typo'],
  ])('names the source file and bad field %#', (value, field) => {
    let message = '';
    try {
      parse(value);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain(file);
    expect(message).toContain(field);
  });

  it('rejects duplicate IDs across catalogs and IDs that differ from filenames', () => {
    expect(() =>
      parse(encounter, { './keystones/written_clause.json': { ...keystone, id: 'written_clause' } }),
    ).toThrow(/duplicate/);
    expect(() => parse({ ...encounter, id: 'other' })).toThrow(/id: must match filename/);
  });

  it('orders catalogs by filename independently of input insertion order', () => {
    const files = {
      './encounters/a_b.json': { ...encounter, id: 'a_b' },
      './encounters/a1.json': { ...encounter, id: 'a1' },
    };
    expect(parseContent(files, {}, refs).encounters.map(value => value.id)).toEqual(['a1', 'a_b']);
  });

  it.each([
    [{ ...keystone, availableWhen: {} }, 'availableWhen'],
    [{ ...keystone, availableWhen: { cycle: 4 } }, 'deadline'],
    [{ ...keystone, availableWhen: { lead: 'missing' } }, 'availableWhen.lead'],
    [{ ...keystone, piece: 'invalid' }, 'piece'],
    [{ ...keystone, piece: 'where' }, 'piece'],
    [{ ...keystone, piece: 'who' }, 'piece'],
    [{ ...keystone, piece: 'why' }, 'piece'],
    [{ ...keystone, requires: { crew: ['missing'] } }, 'requires.crew.0'],
  ])('validates keystones with filename and field %#', (value, field) => {
    let message = '';
    try {
      parse(encounter, { [keyFile]: value });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain(keyFile);
    expect(message).toContain(field);
  });

  it('protects data and cycle contracts from downstream zones', () => {
    const config = JSON.parse(readFileSync('.github/zones.json', 'utf8')) as ZoneConfig;
    const files = ['src/data/schema.ts', 'src/data/validate.ts', 'src/data/index.ts', 'src/engine/cycle.ts'];
    for (const zone of ['feature', 'content']) expect(checkZones({ zone, files }, config).violations).toEqual(files);
  });
});

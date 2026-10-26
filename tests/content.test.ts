import { scheduleKeystones } from '../src/engine/keystones';
import { auditReachability } from './content-reachability';
import type { Encounter, Keystone, Season } from '../src/data/schema';
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
  crewIds: data.crew.filter(member => member.assignable).map(member => member.id),
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
const encounter = data.encounters.find(entry => entry.id === 'written_clause')!;
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
    expect(encounter).toMatchObject({
      id: 'written_clause',
      title: 'The Written Clause',
      layer: 'crisis',
      archetype: 'standoff',
    });
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
    [{ ...encounter, title: undefined }, 'title'],
    [{ ...encounter, title: '' }, 'title'],
    [{ ...encounter, title: 42 }, 'title'],
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

  it.each(['renata', 'halvorsen', 'wren', 'cass', 'miri'])('rejects operational requirements for %s', id => {
    const requires = { crew: [id] };
    expect(() => parse({ ...encounter, requires })).toThrow(`requires.crew.0: unknown reference "${id}"`);
    expect(() => parse(encounter, { [keyFile]: { ...keystone, requires } })).toThrow(
      `requires.crew.0: unknown reference "${id}"`,
    );
    expect(() => parseData({ ...data, encounters: { [file]: { ...encounter, requires } }, keystones: {} })).toThrow(
      file,
    );
    expect(() => parseData({ ...data, encounters: {}, keystones: { [keyFile]: { ...keystone, requires } } })).toThrow(
      keyFile,
    );
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

// Metadata gates remain useful before content activation; no synthetic fixture is a real ending.
describe('M0 reachability policy', () => {
  const season: Extract<Season, { status: 'configured' }> = {
    status: 'configured',
    slice: { firstId: 'opening', middleIds: ['middle_a', 'middle_b'], finaleId: 'finale', minCompletedMiddle: 2 },
    full: {
      firstId: 'opening',
      middleIds: ['middle_a', 'middle_b', 'conditional'],
      conditionalId: 'conditional',
      finaleId: 'finale',
      minCompletedMiddle: 2,
    },
  };
  const keys = (): Keystone[] =>
    ['opening', 'middle_a', 'middle_b', 'conditional', 'finale'].map(id => ({
      ...keystone,
      id,
      elevates: 'standoff',
      piece: 'none',
      deadline: id === 'conditional' ? 6 : 4,
    }));
  const audit = (ks = keys(), es: Encounter[] = [], config: Season = season) =>
    auditReachability(
      es,
      ks,
      config,
      Object.fromEntries([
        ...ks.map(key => [`./keystones/${key.id}.json`, key]),
        ...es.map(entry => [`./encounters/${entry.id}.json`, entry]),
      ]),
    );

  it('accepts both modes, including a full-only cycle-six conditional', () => {
    expect(audit()).toEqual([]);
  });

  it.each(['slice', 'full'] as const)('schedules depleted opening and emergency finale throughout %s', mode => {
    const roles = season[mode];
    const clockLength = mode === 'slice' ? 4 : 6;
    for (let cycle = 1; cycle <= (mode === 'slice' ? 4 : 6); cycle++) {
      const input = {
        cycle: { cycle, actionsLeft: 0, pursuit: { value: clockLength, length: clockLength }, edgeEarnedCrewIds: [] },
        resources: { Credits: 0 },
        ships: [],
        crew: [],
        gear: [],
        flags: {},
        leads: [],
        keystones: keys(),
        roles,
      };
      // Opening precedes even an emergency finale; this is the scheduler's real depleted-state path.
      expect(scheduleKeystones({ ...input, completed: [] }).offers.map(offer => offer.keystone.id)).toEqual([
        'opening',
      ]);
      expect(scheduleKeystones({ ...input, completed: ['opening'] }).offers.map(offer => offer.keystone.id)).toEqual([
        'finale',
      ]);
    }
  });
  it.each(['opening', 'finale'])('keeps %s requirement-free with no Credits, ships, crew, gear or flags', id => {
    expect(audit()).toEqual([]);
    for (const requires of [
      { minCredits: 1 },
      { shipTag: 'quiet' },
      { crew: ['priya'] },
      { gear: ['probe'] },
      { flags: ['priya_read'] },
      { cycle: { min: 2 } },
      { minCredits: 0 },
    ]) {
      const ks = keys();
      ks.find(key => key.id === id)!.requires = requires;
      expect(audit(ks)).toContain(`./keystones/${id}.json [${id}]: slice opening/finale requires must be empty`);
    }
  });

  it.each(['slice', 'full'] as const)('enforces the %s deadline horizon', mode => {
    const ks = keys();
    const id = mode === 'slice' ? 'middle_a' : 'conditional';
    ks.find(key => key.id === id)!.deadline = mode === 'slice' ? 5 : 7;
    expect(audit(ks)).toContain(
      `./keystones/${id}.json [${id}]: ${mode} deadline exceeds cycle ${mode === 'slice' ? 4 : 6}`,
    );
  });

  it('checks extra catalog deadlines without assigning them a season role', () => {
    const extra: Keystone = { ...keys()[0]!, id: 'unused', deadline: 6 };
    expect(audit([...keys(), extra])).toEqual([]);
    expect(audit([...keys(), { ...extra, deadline: 99 }])).toContain(
      './keystones/unused.json [unused]: unassigned catalog deadline exceeds cycle 6',
    );
  });
  it('names the season file and missing role ID', () => {
    expect(audit(keys().filter(key => key.id !== 'middle_a'))).toContain(
      'src/data/season.json [middle_a]: slice role missing from keystone catalog',
    );
  });

  it('checks encounter lead targets and availability keys independently', () => {
    expect(audit(keys(), [{ ...encounter, lead: 'middle_a' }])).toEqual([]);
    expect(audit(keys(), [{ ...encounter, lead: 'missing' }])).toContain(
      './encounters/written_clause.json [written_clause]: lead: unknown key missing',
    );
    const ks = keys();
    ks[1]!.availableWhen = { lead: 'missing', cycle: 1 };
    expect(audit(ks)).toContain('./keystones/middle_a.json [middle_a]: availableWhen.lead: unknown key missing');
  });

  it('requires a real encounter producer for lead-only and lead/cycle OR availability', () => {
    const ks = keys();
    ks[1]!.availableWhen = { lead: 'middle_b' };
    expect(audit(ks, [{ ...encounter, lead: 'middle_b' }])).toEqual([]);
    expect(audit(ks, [{ ...encounter, lead: 'middle_a' }])).toContain(
      './keystones/middle_a.json [middle_a]: availableWhen.lead: no encounter producer for middle_b',
    );
    ks[1]!.availableWhen.cycle = 2;
    expect(audit(ks, [{ ...encounter, lead: 'middle_b' }])).toEqual([]);
    expect(audit(ks)).toContain(
      './keystones/middle_a.json [middle_a]: availableWhen.lead: no encounter producer for middle_b',
    );
  });

  it('handles unconfigured state explicitly without inventing roles, while still checking wiring', () => {
    expect(audit([], [], { status: 'unconfigured' })).toEqual([]);
    expect(audit([], [{ ...encounter, lead: 'missing' }], { status: 'unconfigured' })).toHaveLength(1);
  });

  it('audits the real catalog against its loaded season configuration', () => {
    expect(
      auditReachability(data.encounters, data.keystones, data.season, {
        ...encounterFiles,
        ...keystoneFiles,
      }),
    ).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { data } from '../src/data';
import seasonFile from '../src/data/season.json';
import { parseData, parseSeason } from '../src/data/validate';
import { RunController } from '../src/bridge/run';
import { newGameState } from '../src/engine/rules';
import { simulationEncounters, simulationKeystones, simulationRoles, simulationSeason } from './simulation-fixtures';

const season = simulationSeason;
const mode = (name: 'slice' | 'full', change: object) => ({ ...season, [name]: { ...season[name], ...change } });
const configuredData = { ...data, encounters: [], keystones: simulationKeystones, season };
const files = Object.fromEntries(simulationKeystones.map(k => [`./keystones/${k.id}.json`, k]));

describe('season configuration', () => {
  it('loads the real explicit unconfigured state without inventing a catalog', () => {
    expect(data.season).toEqual(seasonFile);
    expect(parseData({ ...data, encounters: {}, keystones: {} }).season).toEqual({ status: 'unconfigured' });
    expect(new RunController(data, {}).configured).toBe(false);
    expect(() => parseData({ ...data, encounters: {}, keystones: {}, season: undefined })).toThrow('season.json');
    expect(new RunController({ ...configuredData, keystones: [] }, {}).configured).toBe(false);
    expect(new RunController({ ...data, keystones: [] }, { keystoneRoles: simulationRoles }).configured).toBe(false);
  });

  it('validates configured JSON unchanged and allows the conditional role to overlap its middle membership', () => {
    expect(parseSeason(season, simulationKeystones)).toEqual(season);
    expect(parseData({ ...configuredData, encounters: {}, keystones: files }).season).toEqual(season);
    expect(parseSeason(mode('full', { minCompletedMiddle: 3 }), simulationKeystones)).toEqual(
      mode('full', { minCompletedMiddle: 3 }),
    );
  });

  it.each([
    [undefined, 'season.json'],
    [{ status: 'unconfigured', slice: season.slice }, 'slice'],
    [{ status: 'configured', slice: season.slice }, 'full'],
    [mode('slice', { minCompletedMiddle: 1 }), 'minCompletedMiddle'],
    [mode('slice', { middleIds: ['middle_where'] }), 'middleIds'],
    [mode('slice', { conditionalId: 'middle_where' }), 'conditionalId'],
    [mode('full', { middleIds: season.slice.middleIds }), 'middleIds'],
    [mode('full', { conditionalId: undefined }), 'conditionalId'],
    ...[-1, 1, 4, 2.5].map(minCompletedMiddle => [mode('full', { minCompletedMiddle }), 'minCompletedMiddle']),
    [mode('full', { conditionalId: 'opening' }), 'full.conditionalId'],
    [mode('slice', { firstId: 'middle_why' }), 'full.firstId'],
    [mode('slice', { finaleId: 'middle_why' }), 'full.finaleId'],
    [mode('full', { conditionalId: 'middle_where' }), 'full.middleIds'],
  ] as [unknown, string][])(
    'rejects malformed or inconsistent configuration with its filename and field %#',
    (value, field) => {
      expect(() => parseSeason(value, simulationKeystones)).toThrow('season.json');
      expect(() => parseSeason(value, simulationKeystones)).toThrow(String(field));
    },
  );

  it.each(['slice', 'full'] as const)('validates known and unique %s roles', name => {
    for (const [change, field] of [
      [{ firstId: 'missing' }, 'firstId'],
      [{ finaleId: 'missing' }, 'finaleId'],
      [{ middleIds: season[name].middleIds.map((id, i) => (i ? id : 'missing')) }, 'middleIds.0'],
      [{ firstId: season[name].middleIds[0] }, 'duplicate'],
      [{ finaleId: 'opening' }, 'duplicate'],
      [{ middleIds: season[name].middleIds.map(() => 'middle_where') }, 'duplicate'],
    ] as const) {
      expect(() => parseSeason(mode(name, change), simulationKeystones)).toThrow('season.json');
      expect(() => parseSeason(mode(name, change), simulationKeystones)).toThrow(String(field));
    }
  });

  it('rejects activation without matching keystone files and omission of a slice middle in full mode', () => {
    expect(() => parseData({ ...configuredData, encounters: {}, keystones: {} })).toThrow(/season.json.*unknown/);
    const extra = { ...simulationKeystones[0]!, id: 'extra' };
    expect(() =>
      parseSeason(mode('full', { middleIds: ['middle_where', 'extra', 'middle_why'] }), [
        ...simulationKeystones,
        extra,
      ]),
    ).toThrow('full.middleIds');
  });

  it.each([false, true])('wires data roles into RunController for slice=%s', slice => {
    const run = new RunController(configuredData, { slice });
    expect(run.configured).toBe(true);
    run.state.completed = ['opening', ...season.slice.middleIds];
    run.state.cycle.cycle = 8;
    run.refresh(newGameState(data.rules), { aid: true });
    expect(run.state.offers.map(o => o.entry.id)).toEqual(slice ? ['finale'] : ['middle_why']);
  });

  it.each([false, true])('prioritizes only leads used by the selected mode (slice=%s)', slice => {
    const producer = simulationEncounters.find(e => e.id === 'lead_where')!;
    const run = new RunController(
      {
        ...configuredData,
        encounters: [producer, { ...producer, id: 'lead_conditional', lead: 'middle_why' }],
        keystones: simulationKeystones.map(k =>
          k.id === 'middle_why'
            ? { ...k, availableWhen: { lead: k.id }, deadline: 4, requires: {} }
            : k.id === 'middle_where'
              ? { ...k, availableWhen: { lead: k.id }, deadline: 6 }
              : k.id === 'middle_who'
                ? { ...k, availableWhen: { cycle: 20 }, deadline: 20 }
                : k,
        ),
      },
      { slice },
    );
    run.state.completed = ['opening'];
    run.refresh(newGameState(data.rules), {});
    expect(run.state.encounterBoard?.[0]?.id).toBe(slice ? 'lead_where' : 'lead_conditional');
  });

  it('uses full data roles by default and retains an explicit test override', () => {
    const run = new RunController(configuredData, {});
    run.state.completed = ['opening', ...season.slice.middleIds];
    run.state.cycle.cycle = 8;
    run.refresh(newGameState(data.rules), {});
    expect(run.state.offers.map(o => o.entry.id)).toEqual(['finale']);
    const override = { firstId: 'middle_where', middleIds: ['middle_who'], finaleId: 'opening', minCompletedMiddle: 1 };
    for (const seasonConfig of [season, { status: 'unconfigured' } as const]) {
      const custom = new RunController(
        { ...configuredData, season: seasonConfig },
        { slice: true, keystoneRoles: override },
      );
      custom.state.cycle.cycle = 3;
      custom.refresh(newGameState(data.rules), {});
      expect(custom.configured).toBe(true);
      expect(custom.state.offers.map(o => o.entry.id)).toEqual(['middle_where']);
    }
  });
});

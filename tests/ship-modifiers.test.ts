import { describe, expect, it } from 'vitest';
import { Compiler } from 'inkjs/full';
import { readFileSync } from 'node:fs';
import { data } from '../src/data';
import { RulesSchema, ShipsSchema } from '../src/data/schema';
import { shipModifiers } from '../src/engine/ship-modifiers';
import { assistedSetup } from '../src/bridge/roll';
import { RunController } from '../src/bridge/run';
import { GameSession } from '../src/bridge/session';
import { rollPartText } from '../src/ui/strings';
import { storyData } from './helpers';

const pawn = data.ships.find(s => s.id === 'errant_pawn')!;
describe('placeholder ship modifiers', () => {
  it('matches only supported skills and deduplicates ship tags without mutation', () => {
    const ship = { ...pawn, tags: [...pawn.tags, ...pawn.tags] };
    const before = structuredClone(ship);
    for (const skill of ['Gunnery', 'Tactics', 'Pilot', 'Astrogation']) {
      const parts = shipModifiers(ship, skill, data.rules);
      expect(parts).toHaveLength(1);
      expect(parts[0]!.n).toBe(1);
      expect(rollPartText(parts[0]!)).toBe(`Ship: ${skill === 'Gunnery' || skill === 'Tactics' ? 'armed' : 'fast'} +1`);
    }
    expect(shipModifiers(ship, 'Diplomat', data.rules)).toEqual([]);
    expect(shipModifiers(undefined, 'Pilot', data.rules)).toEqual([]);
    expect(shipModifiers(data.ships[1], 'Pilot', data.rules)).toEqual([]);
    for (const skill of ['Typo', 'toString', 'constructor'])
      expect(() => shipModifiers(ship, skill, data.rules)).toThrow('Known:');
    expect(ship).toEqual(before);
  });

  it('validates tags, skill references and strict placeholder numeric definitions', () => {
    expect(() => ShipsSchema.parse([{ ...pawn, tags: ['typo'] }])).toThrow();
    for (const change of [
      { tag: 'typo' },
      { skills: ['Typo'] },
      { skills: ['toString'] },
      { skills: ['constructor'] },
      { n: 1.5 },
      { n: -1 },
      { n: 0 },
      { n: Infinity },
      { n: '1' },
      { placeholder: false },
      { extra: true },
    ]) {
      expect(() =>
        RulesSchema.parse({ ...data.rules, shipModifiers: [{ ...data.rules.shipModifiers[0], ...change }] }),
      ).toThrow();
    }
    expect(() =>
      RulesSchema.parse({ ...data.rules, shipModifiers: [data.rules.shipModifiers[0], data.rules.shipModifiers[0]] }),
    ).toThrow();
  });

  it('lets the assigned ship alone change the best skill selection', () => {
    const fixture = structuredClone(data);
    fixture.character.skills = { Diplomat: 1, Tactics: 1 };
    fixture.character.chars.INT = fixture.character.chars.SOC = 8;
    const run = new RunController(fixture, {});
    const request = { skills: ['Diplomat', 'Tactics'], bonuses: [], target: 8 };
    const select = () => assistedSetup(fixture, request, () => false, [], {}, run.state);
    expect(select().parts[0]!.label).toBe('Diplomat');
    run.state.assignments.shipId = pawn.id;
    expect(select().parts[0]!.label).toBe('Tactics');
    expect(select().mod).toBe(2);
    run.state.assignments.shipId = 'ardent_venture';
    expect(select().parts[0]!.label).toBe('Diplomat');
    expect(select().mod).toBe(1);
  });

  it('selects after the ship bonus and preserves one best assist plus flags', () => {
    const fixture = structuredClone(data);
    fixture.character.skills = { Diplomat: 1, Tactics: 0 };
    fixture.character.chars.INT = fixture.character.chars.SOC = 8;
    fixture.crew.forEach(c => {
      c.assist = { skill: 'Tactics', n: 1 };
    });
    const run = new RunController(fixture, {});
    run.state.assignments.shipId = pawn.id;
    const request = { skills: ['Diplomat', 'Tactics'], bonuses: ['priya_read'], target: 8 };
    const ids = fixture.crew.map(c => c.id);
    const trust = Object.fromEntries(ids.map(id => [id, 3]));
    const setup = assistedSetup(fixture, request, () => true, ids, trust, run.state);
    expect(setup.parts[0]!.label).toBe('Tactics');
    expect(setup.mod).toBe(4);
    expect(setup.parts.filter(p => p.assist)).toHaveLength(1);
    expect(setup.parts.filter(p => p.ship)).toHaveLength(1);
    run.state.assignments.shipId = 'ardent_venture';
    expect(assistedSetup(fixture, request, () => true, [], trust, run.state).parts[0]!.label).toBe('Diplomat');
  });
});

it('recreates staged ship odds on reload and commits the displayed modifier', () => {
  const ink = new Compiler(`${readFileSync('src/story/lib/world.ink', 'utf8')}
${readFileSync('src/story/lib/roll.ink', 'utf8')}
-> END
=== ship_test ===
+ [Check]
    -> roll("Gunnery", 8, "", -> done, -> done, -> done)
=== done ===
-> scene_end
`)
    .Compile()
    .ToJson()!;
  const fixture = { ...storyData, encounters: [{ ...storyData.encounters[0]!, knot: 'ship_test', requires: {} }] };
  const s = new GameSession({ data: fixture, inkJson: ink, seed: 17 });
  s.pickOffer('written_clause');
  s.assign({ shipId: pawn.id, crewIds: [] });
  s.confirm();
  const before = s.save();
  const stage = (session: GameSession) => {
    session.act(0);
    session.act('odds');
    return session.store.getState().odds!;
  };
  const odds = stage(s);
  expect(odds.parts.filter(p => p.ship)).toEqual([{ label: 'armed', n: 1, ship: { tag: 'armed' } }]);
  expect(s.save()).toEqual(before);
  const loaded = new GameSession({ data: fixture, inkJson: ink, saved: s.save() });
  expect(stage(loaded)).toEqual(odds);
  s.act('try');
  loaded.act('try');
  const roll = s.store
    .getState()
    .events.filter(e => e.type === 'roll')
    .at(-1)!;
  expect(roll).toMatchObject({ mod: odds.mod });
  expect(loaded.store.getState().events).toEqual(s.store.getState().events);
  expect(loaded.save()).toEqual(s.save());
});

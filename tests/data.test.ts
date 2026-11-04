import { describe, expect, it } from 'vitest';
import rules from '../src/data/rules.json';
import character from '../src/data/character.json';
import crew from '../src/data/crew.json';
import ships from '../src/data/ships.json';
import { data } from '../src/data';
import { parseData } from '../src/data/validate';

const raw = { rules, character, crew, ships, season: { status: 'unconfigured' } };

describe('data files', () => {
  it('load and validate', () => {
    expect(data.character.name).toBe('Marcus Torin');
    expect(data.crew.length).toBeGreaterThan(0);
    expect(data.ships.filter(s => s.main)).toHaveLength(1);
  });
  it('every skill has a characteristic and every crew id is unique', () => {
    for (const skill of Object.keys(data.character.skills)) expect(data.rules.skillChar).toHaveProperty(skill);
    const ids = data.crew.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('keeps the full catalog with explicit assignment permissions', () => {
    const parsed = parseData(raw);
    expect(parsed.crew).toEqual(crew);
    expect(parsed.crew.filter(c => c.assignable).map(c => c.id)).toEqual(['priya', 'tally', 'lysa', 'eli', 'ariadne']);
    expect(parsed.crew.filter(c => !c.assignable).map(c => c.id)).toEqual([
      'renata',
      'halvorsen',
      'cass',
      'miri',
      'wren',
    ]);
  });
  it.each([undefined, 'true', 1, null])(
    'requires boolean assignable and identifies the crew entry (%s)',
    assignable => {
      expect(() => parseData({ ...raw, crew: [{ ...crew[0], assignable }] })).toThrow(/crew\.json renata: assignable:/);
    },
  );
  it('rejects out-of-range characteristic scores', () => {
    const bad = { ...raw, character: { ...character, chars: { ...character.chars, SOC: 15 } } };
    expect(() => parseData(bad)).toThrow();
  });
  it('rejects a skill with no characteristic mapping', () => {
    const bad = { ...raw, character: { ...character, skills: { ...character.skills, Basketweaving: 1 } } };
    expect(() => parseData(bad)).toThrow(/Basketweaving/);
  });
  it('rejects rules missing a core resource', () => {
    const { Edge: _edge, ...rest } = rules.resources;
    expect(() => parseData({ ...raw, rules: { ...rules, resources: rest } })).toThrow(/Edge/);
    const { Renown: _renown, ...withoutRenown } = rules.resources;
    expect(() => parseData({ ...raw, rules: { ...rules, resources: withoutRenown } })).toThrow(/Renown/);
  });
  it('rejects malformed crew entries', () => {
    expect(() => parseData({ ...raw, crew: [{ id: 'x' }] })).toThrow(/crew\.json x:/);
  });
  it('validates crew assist skills and trust bounds', () => {
    expect(() => parseData({ ...raw, crew: [{ ...crew[0], assist: { skill: 'Unknown', n: 1 } }] })).toThrow(
      /assist.skill.*Unknown/,
    );
    expect(() => parseData({ ...raw, crew: [{ ...crew[0], trust: 4 }] })).toThrow(/trust/);
  });
  it('validates ship upkeep and unique ids', () => {
    expect(() => parseData({ ...raw, ships: [{ ...ships[0], upkeep: -1 }] })).toThrow(/upkeep/);
    expect(() => parseData({ ...raw, ships: [ships[0], ships[0]] })).toThrow(/duplicate ids/);
  });
  it('preserves placeholder markers on new entity numbers', () => {
    const parsed = parseData(raw);
    expect(parsed.crew.every(member => member.placeholder)).toBe(true);
    expect(parsed.ships.every(ship => ship.placeholder)).toBe(true);
  });
  it('rejects a nonpositive Edge reward', () => {
    expect(() => parseData({ ...raw, rules: { ...rules, cycle: { ...rules.cycle, edgeReward: 0 } } })).toThrow(
      /edgeReward/,
    );
  });

  it('validates explicit placeholder upkeep rules without defaults', () => {
    expect(parseData(raw).rules.cycle.upkeep).toEqual(rules.cycle.upkeep);
    const { upkeep: _upkeep, ...cycle } = rules.cycle;
    expect(() => parseData({ ...raw, rules: { ...rules, cycle } })).toThrow(/upkeep/);
  });

  it.each([
    { warningLead: 1 },
    { warningLead: 4 },
    { arrearsLimit: 0 },
    { targetFrom: 0 },
    { targetFrom: 3, strainFrom: 2 },
    { strainFrom: 4 },
    { targetPenalty: 0 },
    { renownLoss: -1 },
    { strainGain: 0 },
    { placeholder: false },
    { extra: 1 },
    { warningLead: 2.5 },
  ])('rejects invalid upkeep thresholds or values (%j)', change => {
    const cycle = { ...rules.cycle, upkeep: { ...rules.cycle.upkeep, ...change } };
    expect(() => parseData({ ...raw, rules: { ...rules, cycle } })).toThrow(/upkeep/);
  });
});

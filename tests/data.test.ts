import { describe, expect, it } from 'vitest';
import rules from '../src/data/rules.json';
import character from '../src/data/character.json';
import crew from '../src/data/crew.json';
import ships from '../src/data/ships.json';
import { data } from '../src/data';
import { parseData } from '../src/data/validate';

const raw = { rules, character, crew, ships };

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
  });
  it('rejects malformed crew entries', () => {
    expect(() => parseData({ ...raw, crew: [{ id: 'x' }] })).toThrow();
  });
});

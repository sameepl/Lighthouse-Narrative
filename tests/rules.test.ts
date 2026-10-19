import { describe, expect, it } from 'vitest';
import { data } from '../src/data';
import {
  addResource,
  charMod,
  gradeOf,
  makeRoll,
  newGameState,
  oddsOf,
  setupRoll,
  spendEdge,
} from '../src/engine/rules';

const { rules, character } = data;
const noBonus = () => false;

describe('characteristic modifiers', () => {
  it.each([
    [2, -2],
    [3, -1],
    [5, -1],
    [6, 0],
    [8, 0],
    [9, 1],
    [10, 1],
    [11, 1],
    [12, 2],
  ])('score %i gives %i', (score, mod) => {
    expect(charMod(score, rules)).toBe(mod);
  });
});

describe('grading', () => {
  it('splits results into clean / cost / fail around the target', () => {
    expect(gradeOf(7, 8, rules)).toBe('fail');
    expect(gradeOf(8, 8, rules)).toBe('cost');
    expect(gradeOf(9, 8, rules)).toBe('cost');
    expect(gradeOf(10, 8, rules)).toBe('clean');
    expect(gradeOf(12, 8, rules)).toBe('clean');
  });
});

describe('setupRoll', () => {
  it('uses the best listed skill plus its characteristic modifier', () => {
    const s = setupRoll(character, rules, { skills: ['Persuade', 'Diplomat'], target: 8, bonuses: [] }, noBonus);
    expect(s.parts).toEqual([
      { label: 'Diplomat', n: 2 },
      { label: 'SOC', n: 1 },
    ]);
    expect(s.mod).toBe(3);
  });
  it('uses INT for Tactics when it is the better skill', () => {
    const s = setupRoll(
      { ...character, skills: { ...character.skills, Leadership: 0, Tactics: 3 } },
      rules,
      { skills: ['Leadership', 'Tactics'], target: 8, bonuses: [] },
      noBonus,
    );
    expect(s.parts.map(p => p.label)).toEqual(['Tactics', 'INT']);
  });
  it('adds a bonus only when its flag is active', () => {
    const req = { skills: ['Persuade'], target: 8, bonuses: ['priya_read'] };
    expect(setupRoll(character, rules, req, () => false).mod).toBe(2);
    expect(setupRoll(character, rules, req, () => true).mod).toBe(3);
  });
  it('fails loudly on unknown skills and bonuses', () => {
    expect(() => setupRoll(character, rules, { skills: ['Persuad'], target: 8, bonuses: [] }, noBonus)).toThrow(
      /Unknown skill "Persuad"/,
    );
    expect(() => setupRoll(character, rules, { skills: ['Persuade'], target: 8, bonuses: ['nope'] }, noBonus)).toThrow(
      /Unknown bonus "nope"/,
    );
    expect(() => setupRoll(character, rules, { skills: [], target: 8, bonuses: [] }, noBonus)).toThrow(
      /at least one skill/,
    );
  });
});

describe('odds', () => {
  it('matches hand-computed 2d6 probabilities', () => {
    const setup = setupRoll(character, rules, { skills: ['Diplomat'], target: 8, bonuses: [] }, noBonus); // +3
    const o = oddsOf(setup, rules);
    expect(o.success).toBe(83); // 2d6 >= 5: 30/36
    expect(o.clean).toBe(58); // 2d6 >= 7: 21/36
    expect(o.parts).toEqual(['Diplomat +2', 'SOC +1']);
  });
});

describe('rolling and Edge', () => {
  const setup = setupRoll(character, rules, { skills: ['Diplomat'], target: 8, bonuses: [] }, noBonus);
  it('computes total and grade from dice', () => {
    expect(makeRoll(setup, rules, () => [1, 2])).toMatchObject({ total: 6, grade: 'fail', label: 'Failure' });
    expect(makeRoll(setup, rules, () => [2, 3])).toMatchObject({ total: 8, grade: 'cost' });
    expect(makeRoll(setup, rules, () => [4, 3])).toMatchObject({ total: 10, grade: 'clean' });
  });
  it('Edge re-rolls a failure and the new result stands', () => {
    const failed = makeRoll(setup, rules, () => [1, 1]);
    expect(spendEdge(failed, setup, rules, () => [1, 2])).toMatchObject({
      total: 6,
      grade: 'fail',
      edge: 'Edge spent: re-rolled',
    });
    expect(spendEdge(failed, setup, rules, () => [6, 6]).grade).toBe('clean');
  });
  it('Edge upgrades a cost to clean and refuses a clean', () => {
    const cost = makeRoll(setup, rules, () => [2, 3]);
    expect(spendEdge(cost, setup, rules)).toMatchObject({ grade: 'clean', edge: 'Edge spent: upgraded', total: 8 });
    expect(() =>
      spendEdge(
        makeRoll(setup, rules, () => [6, 6]),
        setup,
        rules,
      ),
    ).toThrow();
  });
});

describe('resources', () => {
  it('starts from rules.json and clamps to min and max', () => {
    const g = newGameState(rules);
    expect(g.res).toEqual({ Credits: 52000, Edge: 3, Strain: 0 });
    expect(addResource(g.res, rules, 'Strain', 99)).toBe(5);
    expect(addResource(g.res, rules, 'Strain', -99)).toBe(0);
    expect(addResource(g.res, rules, 'Edge', 5)).toBe(3);
    expect(addResource(g.res, rules, 'Credits', -3000)).toBe(49000);
  });
  it('rejects unknown resource names', () => {
    expect(() => addResource({}, rules, 'Straine', 1)).toThrow(/Unknown resource "Straine"/);
  });
});

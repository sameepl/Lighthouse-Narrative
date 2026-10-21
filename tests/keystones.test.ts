import { describe, expect, it } from 'vitest';
import { data } from '../src/data';
import type { Keystone } from '../src/data/schema';
import { newCycleState } from '../src/engine/cycle';
import { scheduleKeystones, type KeystoneInput } from '../src/engine/keystones';

const key = (id: string, piece: Keystone['piece'] = 'none'): Keystone => ({
  id,
  knot: id,
  title: 'Test fixture',
  elevates: 'courier',
  availableWhen: { cycle: 1 },
  deadline: 8,
  piece,
  requires: {},
});
const initial = (): KeystoneInput => ({
  cycle: newCycleState(data.rules),
  resources: { Credits: 100 },
  ships: data.ships,
  crew: data.crew,
  gear: ['probe'],
  flags: { ready: true },
  leads: [],
  completed: [],
  roles: {
    firstId: 'opening',
    middleIds: ['a', 'b', 'c'],
    conditionalId: 'c',
    finaleId: 'finale',
    minCompletedMiddle: 2,
  },
  keystones: [key('opening'), key('a', 'where'), key('b', 'who'), key('c', 'why'), key('finale')],
});
const withKey = (input: KeystoneInput, id: string, update: Partial<Keystone>): KeystoneInput => ({
  ...input,
  keystones: input.keystones.map(entry => (entry.id === id ? { ...entry, ...update } : entry)),
});
const ids = (input: KeystoneInput) => scheduleKeystones(input).offers.map(offer => offer.keystone.id);

describe('keystone scheduling', () => {
  it('only offers the opening first, without modifying inputs', () => {
    const input = initial(),
      before = structuredClone(input);
    expect(ids(input)).toEqual(['opening']);
    expect(input).toEqual(before);
  });

  it.each([
    ['a', 'b', 'c'],
    ['c', 'a', 'b'],
    ['b', 'c', 'a'],
  ])('allows middle order %s, %s, %s', (...order) => {
    const input = initial();
    const completed = ['opening'];
    for (const id of order) {
      expect(ids({ ...input, completed })).toContain(id);
      completed.push(id);
    }
    expect(ids({ ...input, completed })).toEqual(['finale']);
    expect(scheduleKeystones({ ...input, completed }).pieces).toEqual(['where', 'who', 'why']);
  });

  it('supports lead OR cycle availability and forces a weak offer exactly at deadline', () => {
    let input = withKey({ ...initial(), completed: ['opening'] }, 'a', {
      availableWhen: { lead: 'a', cycle: 3 },
      deadline: 4,
    });
    expect(ids(input)).not.toContain('a');
    expect(ids({ ...input, leads: ['a'] })).toContain('a');
    input = { ...input, cycle: { ...input.cycle, cycle: 3 } };
    expect(scheduleKeystones(input).offers.find(offer => offer.keystone.id === 'a')).toMatchObject({
      forced: false,
      weak: false,
    });
    input = { ...input, cycle: { ...input.cycle, cycle: 4 } };
    expect(scheduleKeystones(input).offers.find(offer => offer.keystone.id === 'a')).toMatchObject({
      forced: true,
      weak: true,
    });
  });

  it('deadlines override availability gates but preserve hard requirements', () => {
    const input = withKey({ ...initial(), completed: ['opening'] }, 'a', {
      availableWhen: { lead: 'a' },
      deadline: 1,
    });
    expect(scheduleKeystones(input).offers.find(offer => offer.keystone.id === 'a')?.weak).toBe(true);
    const blocked = withKey(input, 'a', { requires: { minCredits: 101 } });
    expect(ids(blocked)).not.toContain('a');
    expect(scheduleKeystones(blocked).blockedDue).toEqual(['a']);
  });

  it('requires two distinct middle completions and reports only evidence actually earned', () => {
    const input = initial();
    expect(ids({ ...input, completed: ['opening', 'a', 'a'] })).not.toContain('finale');
    const ready = scheduleKeystones({ ...input, completed: ['opening', 'a', 'b'] });
    expect(ready.offers.at(-1)?.keystone.id).toBe('finale');
    expect(ready.pieces).toEqual(['where', 'who']);
    const samePieces = withKey(input, 'b', { piece: 'where' });
    expect(ids({ ...samePieces, completed: ['opening', 'a', 'b'] })).toContain('finale');
    expect(scheduleKeystones({ ...samePieces, completed: ['opening', 'a', 'b'] }).pieces).toEqual(['where']);
  });

  it('a finale deadline alone cannot bypass evidence; full Pursuit can', () => {
    const input = withKey({ ...initial(), completed: ['opening'] }, 'finale', { deadline: 1 });
    expect(scheduleKeystones(input).blockedDue).toEqual(['finale']);
    const full = { ...input, cycle: { ...input.cycle, pursuit: { value: 4, length: 4 } } };
    expect(scheduleKeystones(full)).toMatchObject({
      offers: [{ keystone: { id: 'finale' }, forced: true, weak: true }],
      pieces: [],
    });
    expect(ids({ ...full, completed: [] })).toEqual(['opening']);
    expect(scheduleKeystones(withKey(full, 'finale', { requires: { gear: ['missing'] } })).blockedDue).toEqual([
      'finale',
    ]);
  });

  it('reports conditional replacement without completing the keystone or awarding its piece', () => {
    const input = withKey({ ...initial(), completed: ['opening'] }, 'c', { requires: { flags: ['missing'] } });
    const result = scheduleKeystones(input);
    expect(result.commercialReplacement).toBe(true);
    expect(result.pieces).toEqual([]);
    expect(result.offers.some(offer => offer.keystone.id === 'c')).toBe(false);
    expect(input.completed).toEqual(['opening']);
    expect(scheduleKeystones(withKey(input, 'c', { requires: { flags: ['ready'] } })).commercialReplacement).toBe(
      false,
    );
  });

  it.each([
    { minCredits: 101 },
    { shipTag: 'missing' },
    { crew: ['missing'] },
    { gear: ['missing'] },
    { flags: ['missing'] },
    { cycle: { min: 2 } },
    { cycle: { max: 0 } },
  ])('keeps hard requirement %j binding', requires => {
    expect(ids(withKey({ ...initial(), completed: ['opening'] }, 'a', { requires }))).not.toContain('a');
  });

  it('accepts all requirements together and returns terminal state after the finale', () => {
    const input = withKey({ ...initial(), completed: ['opening'] }, 'a', {
      requires: {
        minCredits: 100,
        shipTag: 'quiet',
        crew: ['priya'],
        gear: ['probe'],
        flags: ['ready'],
        cycle: { min: 1, max: 1 },
      },
    });
    expect(ids(input)).toContain('a');
    expect(scheduleKeystones({ ...input, completed: ['opening', 'a', 'finale'] })).toMatchObject({
      ended: true,
      offers: [],
      pieces: ['where'],
    });
  });

  it('is independent of catalog order and does not invent unconfigured content', () => {
    const input = { ...initial(), completed: ['opening'] };
    expect(scheduleKeystones({ ...input, keystones: [...input.keystones].reverse() })).toEqual(
      scheduleKeystones(input),
    );
    expect(() => scheduleKeystones({ ...input, keystones: [] })).toThrow(/Unknown keystone/);
    expect(() => scheduleKeystones({ ...input, completed: ['unknown'] })).toThrow(/Unknown keystone/);
    expect(() => scheduleKeystones({ ...input, keystones: [...input.keystones, input.keystones[0]!] })).toThrow(
      /Duplicate/,
    );
    expect(() => scheduleKeystones({ ...input, roles: { ...input.roles, finaleId: 'opening' } })).toThrow(/distinct/);
    expect(() => scheduleKeystones({ ...input, roles: { ...input.roles, conditionalId: 'opening' } })).toThrow(
      /Conditional/,
    );
    expect(() => scheduleKeystones({ ...input, roles: { ...input.roles, minCompletedMiddle: 4 } })).toThrow(
      /threshold/,
    );
    expect(() => scheduleKeystones({ ...input, cycle: { ...input.cycle, cycle: NaN } })).toThrow(/Invalid cycle/);
  });
});

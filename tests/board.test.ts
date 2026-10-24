import { describe, expect, it } from 'vitest';
import { data, type Encounter } from '../src/data';
import { buildBoard, type BoardInput } from '../src/engine/board';
import { createSeededRng } from '../src/engine/rng';

const base = data.encounters.find(entry => entry.id === 'written_clause')!;
const make = (id: string, layer: Encounter['layer'], cost = 0, change: Partial<Encounter> = {}): Encounter => ({
  ...base,
  id,
  layer,
  archetype: layer === 'crisis' ? 'standoff' : 'courier',
  repeat: { kind: 'once' },
  weight: 1,
  cost,
  ...change,
});
const input = (encounters: Encounter[], change: Partial<BoardInput> = {}): BoardInput => ({
  cycle: 2,
  resources: { Credits: 10 },
  ships: data.ships,
  crew: data.crew,
  gear: [],
  flags: {},
  played: [],
  encounters,
  ...change,
});
const ids = (board: ReturnType<typeof buildBoard>) => board.offers.map(offer => offer.id);

describe('board selection', () => {
  it('uses all hard requirements and treats cost as affordability, not eligibility', () => {
    const required = make('required', 'commercial', 100, {
      requires: {
        minCredits: 10,
        shipTag: 'quiet',
        gear: ['probe'],
        crew: ['priya'],
        flags: ['priya_read'],
        cycle: { min: 2, max: 2 },
      },
    });
    const ready = input([required], { gear: ['probe'], flags: { priya_read: true } });
    expect(ids(buildBoard(ready, createSeededRng(1)))).toEqual(['required']);
    expect(buildBoard(ready, createSeededRng(1)).unmetGuarantees).toContain('affordable');
    for (const change of [
      { resources: { Credits: 9 } },
      { ships: [] },
      { gear: [] },
      { crew: [] },
      { flags: { priya_read: false } },
      { cycle: 1 },
      { cycle: 3 },
    ]) {
      expect(buildBoard({ ...ready, ...change }, createSeededRng(1)).status).toBe('no-eligible-offers');
    }
  });

  it('never repeats once-only offers and applies inclusive cooldown boundaries', () => {
    const once = make('once', 'crisis');
    const repeat = make('repeat', 'commercial', 0, { repeat: { kind: 'repeatable', cooldown: 1 } });
    const played = [
      { id: 'once', cycle: 1 },
      { id: 'repeat', cycle: 1 },
    ];
    expect(ids(buildBoard(input([once, repeat], { cycle: 2, played }), createSeededRng(1)))).toEqual([]);
    expect(ids(buildBoard(input([once, repeat], { cycle: 3, played }), createSeededRng(1)))).toEqual(['repeat']);
    expect(
      ids(buildBoard(input([repeat], { cycle: 2, played: [{ id: 'repeat', cycle: 1 }] }), createSeededRng(1))),
    ).toEqual([]);
    const zero = make('zero', 'commercial', 0, { repeat: { kind: 'repeatable', cooldown: 0 } });
    expect(ids(buildBoard(input([zero], { played: [{ id: 'zero', cycle: 1 }] }), createSeededRng(1)))).toEqual([
      'zero',
    ]);
  });

  it('guarantees a crisis, affordable/stretch commercial choices, and a due lead within capacity', () => {
    const entries = [
      make('crisis_a', 'crisis'),
      make('crisis_b', 'crisis'),
      make('cheap', 'commercial', 5),
      make('stretch', 'commercial', 20),
      make('lead', 'commercial', 7, { lead: 'keystone_a' }),
      make('extra', 'commercial', 3),
    ];
    const board = buildBoard(input(entries, { dueLead: 'keystone_a' }), createSeededRng(4));
    expect(board.status).toBe('ready');
    expect(board.unmetGuarantees).toEqual([]);
    expect(board.offers.filter(offer => offer.layer === 'crisis')).toHaveLength(1);
    expect(board.offers.filter(offer => offer.layer === 'commercial')).toHaveLength(3);
    expect(board.offers.some(offer => offer.lead === 'keystone_a')).toBe(true);
    expect(board.offers.some(offer => offer.cost <= 10)).toBe(true);
    expect(board.offers.some(offer => offer.cost > 10)).toBe(true);
    expect(new Set(ids(board)).size).toBe(board.offers.length);
    const crisisLead = make('crisis_lead', 'crisis', 0, { lead: 'keystone_b' });
    const other = buildBoard(input([...entries, crisisLead], { dueLead: 'keystone_b' }), createSeededRng(4));
    expect(other.offers.filter(offer => offer.layer === 'crisis')).toEqual([crisisLead]);
  });

  it('uses weights and is deterministic across encounter input order and saved RNG state', () => {
    const entries = [
      make('a', 'commercial', 0, { weight: 1 }),
      make('b', 'commercial', 0, { weight: 9 }),
      make('c', 'commercial', 0),
      make('d', 'commercial', 0),
    ];
    expect(ids(buildBoard(input(entries), { next: () => 0 }))[0]).toBe('a');
    expect(ids(buildBoard(input(entries), { next: () => 0.2 }))[0]).toBe('b');
    const rng = createSeededRng(123);
    const saved = rng.getState();
    const first = buildBoard(input(entries), rng);
    const restored = createSeededRng(0);
    restored.setState(saved);
    expect(ids(buildBoard(input([...entries].reverse()), restored))).toEqual(ids(first));
    expect(restored.getState()).toBe(rng.getState());
    const huge = [
      make('huge_a', 'commercial', 0, { weight: 1e308 }),
      make('huge_b', 'commercial', 0, { weight: 1e308 }),
    ];
    expect(ids(buildBoard(input(huge), { next: () => 0.75 }))[0]).toBe('huge_b');
  });

  it('uses only an eligible explicit fallback when the catalog is exhausted', () => {
    const once = make('once', 'crisis');
    const fallback = make('fallback', 'crisis');
    const exhausted = input([once], { played: [{ id: 'once', cycle: 1 }], fallback });
    expect(ids(buildBoard(exhausted, createSeededRng(1)))).toEqual(['fallback']);
    expect(buildBoard(exhausted, createSeededRng(1)).unmetGuarantees).toContain('commercial');
    const unavailable = { ...exhausted, played: [...exhausted.played, { id: 'fallback', cycle: 1 }] };
    expect(buildBoard(unavailable, createSeededRng(1))).toMatchObject({
      offers: [],
      status: 'no-eligible-offers',
    });
    const alteredFallback = make('once', 'commercial', 0, { repeat: { kind: 'repeatable', cooldown: 0 } });
    expect(buildBoard({ ...exhausted, fallback: alteredFallback }, createSeededRng(1)).status).toBe(
      'no-eligible-offers',
    );
    expect(buildBoard(input([], { dueLead: 'missing' }), createSeededRng(1)).unmetGuarantees).toContain('dueLead');
  });

  it('reports impossible guarantees without resurrecting entries or accepting bad draws', () => {
    const onlyCommercial = make('only', 'commercial');
    const board = buildBoard(input([onlyCommercial], { dueLead: 'unavailable' }), createSeededRng(1));
    expect(ids(board)).toEqual(['only']);
    expect(board.unmetGuarantees).toEqual(['crisis', 'commercial', 'stretch', 'dueLead']);
    expect(() => buildBoard(input([onlyCommercial]), { next: () => 1 })).toThrow(/RNG draw/);
    expect(() => buildBoard(input([onlyCommercial], { cycle: 0 }), createSeededRng(1))).toThrow(/cycle/);
  });
});

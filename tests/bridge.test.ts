import { Compiler } from 'inkjs/full';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { data, type Encounter } from '../src/data';
import type { GameData } from '../src/data/validate';
import { GameSession } from '../src/bridge/session';
import type { SessionOptions } from '../src/bridge/session';
import type { SaveData } from '../src/bridge/types';
import { assistedSetup } from '../src/bridge/roll';
import realInk from '../src/story/main.ink';

const ink = new Compiler(`${readFileSync('src/story/lib/world.ink', 'utf8')}
${readFileSync('src/story/lib/roll.ink', 'utf8')}
-> END
=== job ===
A test assignment.
+ [Finish]
    -> scene_end
+ [Risk]
    ~ add("Pursuit", 2)
    -> roll("Diplomat", 8, "", -> done, -> done, -> done)
+ [Hide]
    ~ add("Pursuit", -99)
    Pursuit now {res("Pursuit")}.
    -> scene_end
+ [Expose]
    ~ add("Pursuit", 99)
    Pursuit now {res("Pursuit")}.
    -> scene_end
+ [Trust]
    ~ trust("priya", 3)
    -> roll("Diplomat", 12, "", -> done, -> done, -> done)
+ [Trust again]
    ~ trust("priya", -99)
    ~ trust("priya", 99)
    -> scene_end
+ [Bad trust]
    ~ trust("missing", 1)
    -> scene_end
=== done ===
A resolved test.
-> scene_end
`)
  .Compile()
  .ToJson()!;
const encounter = (id: string): Encounter => ({
  ...data.encounters[0]!,
  id,
  knot: 'job',
  cost: 10,
  repeat: { kind: 'repeatable', cooldown: 0 },
});
const fixture: GameData = {
  ...data,
  encounters: [encounter('a'), { ...encounter('b'), layer: 'commercial' }],
  keystones: [],
};
const make = (opts: Partial<SessionOptions> = {}) =>
  new GameSession({ data: fixture, inkJson: ink, seed: 17, ...opts });
const view = (s: GameSession) => s.store.getState();
const choose = (s: GameSession, text: string) => s.act(view(s).choices.find(c => c.text === text)!.id);
const expectReady = (s: GameSession, ready: boolean) => {
  expect(view(s).choices.some(c => c.command?.code === 'confirm')).toBe(ready);
  expect(view(s).choices.find(c => c.command?.code === 'cancel')?.command).toEqual({ code: 'cancel', ready });
};
const enter = (s: GameSession, crewIds: string[] = []) => {
  s.pickOffer(view(s).offers[0]!.entry.id);
  s.assign({ shipId: data.ships[0]!.id, crewIds });
  s.confirm();
};
const roundtrip = (s: GameSession, opts: Partial<SessionOptions> = {}) =>
  make({ ...opts, saved: JSON.parse(JSON.stringify(s.save())) as SaveData });

describe('Hub and scene bridge', () => {
  it.each([1, 3])('updates trust and rewards once, rolling back every pending change with Edge %s', edge => {
    const original = make().save();
    expect(original.run.crewTrust).toEqual(Object.fromEntries(fixture.crew.map(c => [c.id, c.trust])));
    original.res.Edge = edge;
    original.run.crewTrust.priya = 2;
    const s = make({ saved: original, rng: () => [1, 1] });
    enter(s, ['priya']);
    const before = s.save();
    choose(s, 'Trust');
    const reward = { code: 'trustReward', crewId: 'priya', name: 'Priya', edgeAdded: edge === 3 ? 0 : 1 };
    expect(view(s).crewTrust.priya).toBe(3);
    expect(view(s).res.Edge).toBe(Math.min(3, edge + 1));
    expect(view(s).ledger.at(-1)).toMatchObject({ t: '', command: reward });
    expect(view(s).events.at(-1)).toMatchObject({ type: 'note', command: reward });
    s.act('odds');
    expect(view(s).odds!.parts.find(p => p.assist)?.n).toBe(2);
    view(s).crewTrust.priya = 0;
    expect(roundtrip(s).save()).toEqual(before);
    s.act('back');
    expect(s.save()).toEqual(before);
    choose(s, 'Trust');
    s.act('try');
    expect(view(s).choices.some(c => c.id === 'accept')).toBe(true);
    expect(roundtrip(s).save()).toEqual(before);
    s.act('accept');
    const committed = s.save();
    expect(committed.run.crewTrust.priya).toBe(3);
    expect(committed.run.cycle.edgeEarnedCrewIds).toContain('priya');
    expect(roundtrip(s).save()).toEqual(committed);
    enter(s);
    choose(s, 'Trust again');
    expect(view(s).res.Edge).toBe(Math.min(3, edge + 1));
    expect(view(s).ledger.filter(n => n.command?.code === 'trustReward')).toHaveLength(1);
    expect(fixture.crew.find(c => c.id === 'priya')!.trust).toBe(0);
  });

  it('rejects unknown crew from ink and lists valid IDs', () => {
    const s = make();
    enter(s);
    expect(() => choose(s, 'Bad trust')).toThrow(`Known: ${fixture.crew.map(c => c.id).join(', ')}`);
    expect(view(s).crewTrust).toEqual(Object.fromEntries(fixture.crew.map(c => [c.id, c.trust])));
  });

  it('rejects incomplete or invalid trust maps and discards old version caches and snapshots', () => {
    const s = make();
    enter(s);
    const valid = s.save();
    const trust = valid.run.crewTrust;
    for (const bad of [
      undefined,
      null,
      [],
      {},
      { ...trust, unknown: 0 },
      Object.fromEntries(Object.entries(trust).filter(([id]) => id !== 'priya')),
      ...[-1, 4, 0.5, NaN, Infinity, '1'].map(priya => ({ ...trust, priya })),
      ...['__proto__', 'constructor', 'toString'].map(id => ({ ...trust, [id]: 0 })),
    ]) {
      expect(() => make({ saved: { ...valid, run: { ...valid.run, crewTrust: bad } } as SaveData })).toThrow(
        'Invalid version 3 save',
      );
    }
    choose(s, 'Trust');
    for (const v of [1, 2]) {
      const fresh = make({ saved: { ...s.save(), v } as unknown as SaveData }).save();
      expect(fresh.run).toEqual(make().save().run);
      expect(fresh.events).toEqual([]);
      expect(fresh.v).toBe(3);
    }
  });

  it('saves structured upkeep, detaches its metadata, and retains plain ink notes', () => {
    const s = make();
    s.endCycle();
    const before = s.save();
    expect(before.ledger).toEqual([{ kind: 'cost', t: '', command: { code: 'cycleUpkeep', amount: 4000 } }]);
    expect(before.events.at(-1)).toMatchObject(before.ledger[0]!);
    Object.assign(view(s).ledger[0]!.command!, { amount: 999 });
    const event = view(s).events.at(-1)!;
    if (event.type === 'note') Object.assign(event.command!, { amount: 998 });
    expect(s.save()).toEqual(before);
    expect(roundtrip(s).save()).toEqual(before);
    const legacy = structuredClone(before);
    legacy.ledger = [{ kind: 'cost', t: 'Cycle upkeep paid: Cr4000.' }];
    legacy.events = [{ id: 1, type: 'note', ...legacy.ledger[0]! }];
    expect(make({ saved: legacy }).save()).toEqual(legacy);
  });

  it('publishes detached assist metadata with unchanged odds and restores Back', () => {
    const s = make();
    enter(s, ['priya']);
    const before = s.save();
    choose(s, 'Risk');
    expect(view(s).choices.map(c => c.command?.code)).toEqual(['try', 'odds', 'back']);
    expect(view(s).choices.every(c => c.text === '' && c.sub === undefined)).toBe(true);
    s.act('odds');
    const odds = view(s).odds!;
    expect(odds).toMatchObject({ target: 8, mod: 4, success: 92, clean: 72 });
    const part = odds.parts.find(p => p.assist)!;
    expect(part).toMatchObject({ n: 1, assist: { crewId: 'priya', name: 'Priya' } });
    part.assist!.name = 'Changed';
    part.n = 999;
    s.act('odds');
    expect(view(s).odds!.parts.find(p => p.assist)).toMatchObject({ n: 1, assist: { name: 'Priya' } });
    expect(s.save()).toEqual(before);
    s.act('back');
    expect(s.save()).toEqual(before);
  });

  it('keeps a fixed encounter draw and RNG state through scene completion', () => {
    const s = make();
    const before = s.save();
    enter(s);
    choose(s, 'Finish');
    expect(s.save().run.encounterBoard).toEqual(before.run.encounterBoard);
    expect(s.save().run.rngState).toBe(before.run.rngState);
    const originalIds = before.run.offers.map(offer => offer.entry.id);
    expect(view(s).offers.every(offer => originalIds.includes(offer.entry.id))).toBe(true);
    expect(view(s).offers.some(offer => offer.entry.id === before.run.offers[0]!.entry.id)).toBe(false);
  });
  it('starts at Hub and existing command choices can prepare, cancel, and commit exactly once', () => {
    const s = make(),
      before = s.save();
    s.act(view(s).choices[0]!.id);
    expect(view(s).phase).toBe('prepare');
    expectReady(s, true);
    s.act('ship:errant_pawn');
    s.act('crew:priya');
    s.act('cancel');
    expect(s.save()).toEqual(before);
    s.act(view(s).choices[0]!.id);
    s.act('ship:errant_pawn');
    s.act('confirm');
    expect(view(s).phase).toBe('scene');
    expect(view(s).cycle.actionsLeft).toBe(1);
    expect(view(s).res.Credits).toBe(51990);
    expect(s.save().run.played).toHaveLength(1);
    expect(() => s.confirm()).toThrow(/prepare/);
    choose(s, 'Finish');
    expect(view(s).phase).toBe('hub');
    expect(s.save().run.played).toHaveLength(1);
  });

  it('confirms The Written Clause through commands without assigning a ship', () => {
    const s = new GameSession({ inkJson: realInk, data });
    const before = s.save();
    s.act('offer:written_clause');
    expect(view(s).assignments).toEqual({ shipId: null, crewIds: [] });
    expectReady(s, true);
    s.act('cancel');
    expect(s.save()).toEqual(before);
    s.act('offer:written_clause');
    s.act('confirm');
    expect(view(s).phase).toBe('scene');
    expect(view(s).assignments.shipId).toBeNull();
    expect(view(s).cycle.actionsLeft).toBe(before.run.cycle.actionsLeft - 1);
    expect(view(s).res.Credits).toBe(before.res.Credits);
  });

  it('plays deterministic multiple cycles, enforces busy crew, and clears them at upkeep', () => {
    const s = make();
    enter(s, ['priya']);
    choose(s, 'Finish');
    expect(view(s).busyCrewIds).toEqual(['priya']);
    s.pickOffer(view(s).offers[0]!.entry.id);
    expect(() => s.assign({ shipId: 'errant_pawn', crewIds: ['priya'] })).toThrow(/unavailable/);
    s.assign({ shipId: 'errant_pawn', crewIds: ['cass'] });
    s.confirm();
    choose(s, 'Finish');
    expect(view(s).boardStatus).toBe('actions-spent');
    const saved = roundtrip(s);
    s.endCycle();
    saved.endCycle();
    expect(saved.save()).toEqual(s.save());
    expect(view(s).cycle).toMatchObject({ cycle: 2, actionsLeft: 2, pursuit: { value: 1 } });
    expect(view(s).busyCrewIds).toEqual([]);
    expect(view(s).res.Credits).toBe(47980);
    enter(s);
    choose(s, 'Finish');
    enter(s);
    choose(s, 'Finish');
    s.endCycle();
    expect(view(s).cycle.cycle).toBe(3);
  });

  it('roundtrips Hub, Prepare and committed mid-scene without a redraw or double charge', () => {
    const s = make();
    expect(roundtrip(s).save()).toEqual(s.save());
    s.pickOffer(view(s).offers[0]!.entry.id);
    s.assign({ shipId: 'errant_pawn', crewIds: ['priya'] });
    const prepared = roundtrip(s);
    expect(prepared.save()).toEqual(s.save());
    prepared.confirm();
    const loaded = roundtrip(prepared);
    expect(loaded.save()).toEqual(prepared.save());
    choose(loaded, 'Finish');
    expect(view(loaded).res.Credits).toBe(51990);
    expect(view(loaded).cycle.actionsLeft).toBe(1);
  });

  it('roll snapshots restore inline Pursuit, feed and full run state, including default dice seed', () => {
    const s = make();
    enter(s, ['priya']);
    const before = s.save();
    choose(s, 'Risk');
    expect(view(s).cycle.pursuit.value).toBe(2);
    expect(s.save()).toEqual(before);
    s.act('back');
    expect(s.save()).toEqual(before);
    choose(s, 'Risk');
    const loaded = roundtrip(s);
    expect(loaded.save()).toEqual(before);
    choose(loaded, 'Risk');
    s.act('try');
    loaded.act('try');
    expect(view(s)).toEqual(view(loaded));
    if (view(s).choices.some(c => c.id === 'accept')) {
      s.act('accept');
      loaded.act('accept');
    }
    expect(s.save()).toEqual(loaded.save());
  });

  it('direct ink Pursuit is one clamped clock, not a fifth resource', () => {
    const s = make();
    enter(s);
    choose(s, 'Hide');
    expect(view(s).cycle.pursuit.value).toBe(0);
    enter(s);
    choose(s, 'Expose');
    expect(view(s).cycle.pursuit.value).toBe(6);
    expect(view(s).boardStatus).toBe('actions-spent');
    s.endCycle();
    expect(view(s).boardStatus).toBe('pursuit-full');
    expect(() => s.endCycle()).toThrow(/Pursuit/);
    expect(view(s).choices.some(c => c.id === 'restart')).toBe(true);
    expect(view(s).res).not.toHaveProperty('Pursuit');
    expect(view(s).events.some(e => e.type === 'para' && e.html.includes('Pursuit now 6'))).toBe(true);
    expect(view(s).cycle).toMatchObject({ cycle: 2, actionsLeft: 2, pursuit: { value: 6 } });
    expect(view(s).boardStatus).toBe('pursuit-full');
    s.act('restart');
    expect(view(s).cycle).toMatchObject({ cycle: 1, actionsLeft: 2, pursuit: { value: 0 } });
  });

  it('rejects illegal actions without modifying the session', () => {
    const s = make(),
      before = s.save();
    for (const action of [0, 'try', 'edge', 'accept', 'back', 'odds'])
      expect(() => s.act(action)).toThrow(/unavailable/);
    expect(s.save()).toEqual(before);
    enter(s);
    const scene = s.save();
    expect(() => s.endCycle()).toThrow(/hub/);
    expect(() => s.act('edge')).toThrow(/unavailable/);
    expect(s.save()).toEqual(scene);
  });

  it('discards v1 even through direct construction and exposes honest real-catalog exhaustion', () => {
    const s = new GameSession({ inkJson: realInk, data, saved: { v: 1 } as unknown as SaveData });
    expect(view(s).phase).toBe('hub');
    expect(view(s).schedulerStatus).toBe('unconfigured');
    enter(s);
    choose(s, 'Decline for now');
    choose(s, 'Continue');
    expect(view(s).boardStatus).toBe('no-eligible-offers');
    expect(view(s).offers).toEqual([]);
  });

  it('consumes initial trust rewards once and keeps published snapshots detached', () => {
    const trusted = { ...fixture, crew: fixture.crew.map(c => ({ ...c, trust: 3 })) };
    const s = make({ data: trusted });
    expect(s.save().run.cycle.edgeEarnedCrewIds).toHaveLength(trusted.crew.length);
    const before = s.save();
    view(s).cycle.pursuit.value = 99;
    view(s).offers.length = 0;
    expect(s.save()).toEqual(before);
    const loaded = roundtrip(s, { data: trusted });
    loaded.endCycle();
    expect(loaded.save().run.cycle.edgeEarnedCrewIds).toEqual(before.run.cycle.edgeEarnedCrewIds);
  });

  it('only uses the best matching assigned assist, including trust improvement', () => {
    const members = fixture.crew.map(c => ({ ...c, assist: { skill: 'Diplomat', n: 1 }, trust: 3 }));
    const setup = assistedSetup(
      { ...fixture, crew: members },
      { skills: ['Diplomat'], bonuses: [], target: 8 },
      () => false,
      members.map(c => c.id),
      Object.fromEntries(members.map(c => [c.id, c.trust])),
    );
    expect(setup.mod).toBe(5);
    expect(setup.parts.filter(p => p.assist)).toEqual([
      { label: members[0]!.name, n: 2, assist: { crewId: members[0]!.id, name: members[0]!.name } },
    ]);
    expect(
      assistedSetup(fixture, { skills: ['Diplomat'], bonuses: [], target: 8 }, () => false, ['cass'], { cass: 0 }).mod,
    ).toBe(3);
  });
});

// All metadata and knots below are test fixtures, not canonical campaign content.
describe('bridge scheduling and assignment boundaries', () => {
  it('schedules explicit keystone roles, preserves forced priority and ends only after finale completion', () => {
    const keys = ['opening', 'middle', 'finale'].map(id => ({
      id,
      knot: 'job',
      title: `Test ${id} title`,
      elevates: 'courier' as const,
      availableWhen: { cycle: 1 },
      deadline: 9,
      piece: id === 'middle' ? ('removed' as const) : ('none' as const),
      requires: {},
    }));
    const opts = {
      data: { ...fixture, keystones: keys },
      keystoneRoles: { firstId: 'opening', middleIds: ['middle'], finaleId: 'finale', minCompletedMiddle: 1 },
    };
    const s = make(opts);
    expect(view(s).choices.find(c => c.id === 'offer:opening')?.command).toMatchObject({
      code: 'offer',
      offerKind: 'keystone',
      title: 'Test opening title',
    });
    expect(
      view(s).choices.find(c => c.command?.code === 'offer' && c.command.offerKind === 'encounter')?.command,
    ).toMatchObject({
      code: 'offer',
      title: 'The Written Clause',
    });
    s.pickOffer('opening');
    s.assign({ shipId: 'errant_pawn', crewIds: [] });
    s.confirm();
    choose(s, 'Finish');
    const saved = s.save();
    saved.run.cycle.pursuit.value = saved.run.cycle.pursuit.length;
    const full = make({ ...opts, saved });
    // Restore preserves the saved board; a cycle refresh after completion handles the clock change.
    const direct = make(opts);
    direct.pickOffer('opening');
    direct.assign({ shipId: 'errant_pawn', crewIds: [] });
    direct.confirm();
    choose(direct, 'Expose');
    expect(view(direct).offers.map(o => o.entry.id)).toEqual(['finale']);
    expect(() => direct.endCycle()).toThrow(/forced/);
    direct.pickOffer('finale');
    direct.assign({ shipId: 'errant_pawn', crewIds: [] });
    direct.confirm();
    choose(direct, 'Finish');
    expect(view(direct).ended).toBe(true);
    expect(view(direct).choices).toEqual([]);
    expect(full.save().run.rngState).toBe(saved.run.rngState);
  });

  it('enforces required assignments and affordability without spending on failed confirmation', () => {
    const job = { ...encounter('a'), requires: { shipTag: 'quiet', crew: ['priya'] } };
    const s = make({ data: { ...fixture, encounters: [job] } });
    const hub = s.save();
    s.pickOffer('a');
    s.assign({ shipId: null, crewIds: ['priya'] });
    for (const shipId of [null, 'ardent_venture']) {
      s.assign({ shipId, crewIds: ['priya'] });
      expectReady(s, false);
      const before = s.save();
      expect(() => s.confirm()).toThrow('Assign a suitable ship');
      expect(s.save()).toEqual(before);
    }
    s.act('cancel');
    expect(s.save()).toEqual(hub);
    s.act('offer:a');
    s.assign({ shipId: 'errant_pawn', crewIds: [] });
    expectReady(s, false);
    const missingCrew = s.save();
    expect(() => s.confirm()).toThrow(/required crew/);
    expect(s.save()).toEqual(missingCrew);
    expect(() => s.assign({ shipId: 'errant_pawn', crewIds: ['priya', 'priya'] })).toThrow(/Duplicate/);
    s.act('crew:priya');
    expectReady(s, true);
    s.act('confirm');
    expect(view(s).phase).toBe('scene');
    expect(view(s).cycle.actionsLeft).toBe(hub.run.cycle.actionsLeft - 1);
    expect(view(s).res.Credits).toBe(hub.res.Credits! - job.cost);
    const expensive = make({ data: { ...fixture, encounters: [{ ...encounter('expensive'), cost: 999999 }] } });
    expensive.pickOffer('expensive');
    expectReady(expensive, false);
    const before = expensive.save();
    expect(() => expensive.confirm()).toThrow(/Credits/);
    expect(expensive.save()).toEqual(before);
  });

  it('still requires crew for a shipless offer and pays catalog upkeep after completing it', () => {
    const job = { ...encounter('a'), requires: { crew: ['priya'] } };
    const s = make({ data: { ...fixture, encounters: [job] } });
    s.act('offer:a');
    expectReady(s, false);
    const before = s.save();
    expect(() => s.confirm()).toThrow(/required crew/);
    expect(s.save()).toEqual(before);
    s.act('crew:priya');
    expectReady(s, true);
    s.act('confirm');
    expect(view(s).assignments.shipId).toBeNull();
    choose(s, 'Finish');
    s.act('endCycle');
    expect(view(s).res.Credits).toBe(
      before.res.Credits! - job.cost - data.ships.reduce((n, ship) => n + ship.upkeep, 0),
    );
    expect(view(s).cycle).toMatchObject({ cycle: 2, actionsLeft: 2 });
  });

  it('rolls back failed scene entry without charging or reserving the offer', () => {
    const s = make({ data: { ...fixture, encounters: [{ ...encounter('broken'), knot: 'does_not_exist' }] } });
    s.pickOffer('broken');
    s.assign({ shipId: 'errant_pawn', crewIds: [] });
    const before = s.save();
    expect(() => s.confirm()).toThrow();
    expect(s.save()).toEqual(before);
  });
});

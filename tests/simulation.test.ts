import { Compiler } from 'inkjs/full';
import { deepStrictEqual, ok } from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { data } from '../src/data';
import { parseData } from '../src/data/validate';
import { GameSession } from '../src/bridge/session';
import type { SaveData } from '../src/bridge/types';
import { buildBoard } from '../src/engine/board';
import { newCycleState } from '../src/engine/cycle';
import { scheduleKeystones } from '../src/engine/keystones';
import { createSeededRng } from '../src/engine/rng';
import { simulationEncounters, simulationKeystones, simulationRoles, simulationSeason } from './simulation-fixtures';

// Synthetic consequences only: flags/trust/resources flow through the real Ink bridge.
const inkJson = new Compiler(`${readFileSync('src/story/lib/world.ink', 'utf8')}
${readFileSync('src/story/lib/roll.ink', 'utf8')}
VAR aid = false
-> END
=== job ===
A synthetic assignment.
+ [Quiet]
    ~ add("Pursuit", -1)
    -> check
+ [Routine]
    -> check
+ [Loud]
    ~ add("Pursuit", 1)
    -> check
=== check ===
~ trust("priya", 1)
~ aid = true
-> roll("Diplomat", 12, "", -> clean, -> cost, -> fail)
=== clean ===
~ add("Credits", 1500)
~ add("Renown", 1)
~ note("gain", "synthetic clean")
-> scene_end
=== cost ===
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "synthetic cost")
-> scene_end
=== fail ===
~ add("Strain", 2)
~ note("watch", "synthetic fail")
-> scene_end
`)
  .Compile()
  .ToJson()!;
const fixture = parseData({
  ...data,
  season: simulationSeason,
  encounters: Object.fromEntries(simulationEncounters.map(e => [`${e.id}.json`, { ...e, knot: 'job' }])),
  keystones: Object.fromEntries(simulationKeystones.map(k => [`${k.id}.json`, { ...k, knot: 'job' }])),
});

function run(seed: number, slice: boolean) {
  const policy = createSeededRng((seed ^ 0x13579bdf) >>> 0);
  let dice = createSeededRng((seed ^ 0x2468ace0) >>> 0);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(policy.next() * items.length)]!;
  const gear = policy.next() < 0.5 ? ['probe'] : [];
  const reloadPoint = pick(['hub', 'prepare', 'scene']);
  const make = (saved?: SaveData) =>
    new GameSession({
      data: fixture,
      inkJson,
      seed,
      slice,
      gear,
      saved,
      rng: () => [1 + Math.floor(dice.next() * 6), 1 + Math.floor(dice.next() * 6)],
    });
  let s: GameSession;
  const view = () => s.store.getState();
  const coverage = new Set<string>();
  const trail: string[] = [];
  const once = new Set<string>();
  const reload = (label: string) => {
    const saved = JSON.parse(JSON.stringify(s.save())) as SaveData;
    const before = view();
    s = make(saved);
    deepStrictEqual(s.save(), saved);
    deepStrictEqual(view(), before);
    coverage.add(`reload:${label}`);
    trail.push(`reload:${label}`);
  };
  try {
    trail.push('start');
    s = make();
    for (let turn = 0; turn < 40 && !view().ended; turn++) {
      ok(view().phase === 'hub');
      if ((turn === 0 && reloadPoint === 'hub') || policy.next() < 0.2) reload('hub');
      const hub = view();
      const hubSave = s.save();
      const roles = simulationSeason[slice ? 'slice' : 'full'];
      const completed = new Set(hubSave.run.completed);
      trail.push(
        `cycle=${hub.cycle.cycle} actions=${hub.cycle.actionsLeft} pursuit=${hub.cycle.pursuit.value} board=${hub.boardStatus} offers=${hub.offers.map(o => `${o.entry.id}${o.forced ? '!' : ''}`).join(',')}`,
      );
      ok(hub.boardStatus !== 'no-eligible-offers', 'Feasible fixture exhausted its board');
      if (hub.cycle.actionsLeft === 0) {
        ok(hub.boardStatus === 'actions-spent');
        coverage.add('actions-spent');
        const cycle = hub.cycle.cycle;
        trail.push('endCycle');
        s.endCycle();
        ok(view().cycle.cycle === cycle + 1);
        ok(view().cycle.actionsLeft === data.rules.cycle.actions);
        deepStrictEqual(view().busyCrewIds, []);
        continue;
      }
      ok(hub.boardStatus === 'ready');
      const legal = hub.offers.filter(o => o.kind === 'keystone' || o.entry.cost <= (hub.res.Credits ?? 0));
      ok(legal.length > 0, 'No runnable offer');
      const forced = hub.offers.filter(o => o.forced);
      if (forced.length) {
        coverage.add('forced');
        ok(!hub.choices.some(c => c.id === 'endCycle'));
        ok(hub.offers.every(o => o.forced));
      }
      // Fixture requirements are feasible: every completed job enables the conditional's aid flag.
      const clockFull = hub.cycle.pursuit.value === hub.cycle.pursuit.length;
      const dueRoles = !completed.has(roles.firstId)
        ? [roles.firstId]
        : clockFull
          ? [roles.finaleId]
          : [
              ...roles.middleIds,
              ...(roles.middleIds.filter(id => completed.has(id)).length >= roles.minCompletedMiddle
                ? [roles.finaleId]
                : []),
            ];
      for (const key of fixture.keystones) {
        if (completed.has(key.id) || !dueRoles.includes(key.id)) continue;
        if (hub.cycle.cycle >= key.deadline || (key.id === roles.finaleId && clockFull)) {
          ok(
            hub.offers.some(o => o.entry.id === key.id && o.forced),
            `Missing forced due offer: ${key.id}`,
          );
          if (hub.cycle.cycle >= key.deadline) coverage.add('deadline');
        }
      }
      for (const offer of hub.offers) {
        if (offer.entry.id === 'gated') coverage.add('gated');
        if (
          offer.kind === 'keystone' &&
          offer.entry.id.startsWith('middle_') &&
          hub.cycle.cycle < (offer.entry.availableWhen.cycle ?? 0)
        )
          coverage.add('early-lead');
      }
      const offer = pick(legal);
      trail.push(`pick=${offer.entry.id}`);
      if (offer.entry.id === 'finale') {
        coverage.add(hub.cycle.pursuit.value === hub.cycle.pursuit.length ? 'clock-finale' : 'evidence-finale');
        if (hub.cycle.pursuit.value < hub.cycle.pursuit.length) {
          ok(roles.middleIds.filter(id => completed.has(id)).length >= roles.minCompletedMiddle);
        }
      }
      const beforePrepare = hubSave;
      s.pickOffer(offer.entry.id);
      if (policy.next() < 0.15) {
        trail.push('cancelPrepare');
        s.cancelPrepare();
        deepStrictEqual(s.save(), beforePrepare);
        coverage.add('cancel');
        s.pickOffer(offer.entry.id);
      }
      const available = view().choices.flatMap(c => (c.command?.code === 'crew' ? [c.command.crewId] : []));
      ok(available.every(id => fixture.crew.some(c => c.id === id && c.assignable) && !hub.busyCrewIds.includes(id)));
      if (hub.busyCrewIds.length) coverage.add('busy');
      const crewIds = [...(offer.entry.requires.crew ?? [])];
      const extra = available.filter(id => !crewIds.includes(id));
      if (extra.length && policy.next() < 0.6) crewIds.push(pick(extra));
      const ships = fixture.ships.filter(
        ship => !offer.entry.requires.shipTag || ship.tags.includes(offer.entry.requires.shipTag),
      );
      const shipId = !offer.entry.requires.shipTag && policy.next() < 0.5 ? null : pick(ships).id;
      trail.push(`assign ship=${shipId} crew=${crewIds.join(',')}`);
      s.assign({ shipId, crewIds });
      ok(view().choices.some(c => c.id === 'confirm'));
      if ((turn === 0 && reloadPoint === 'prepare') || policy.next() < 0.2) reload('prepare');
      trail.push('confirm');
      s.confirm();
      ok(view().cycle.actionsLeft === hub.cycle.actionsLeft - 1);
      ok(view().res.Credits === hub.res.Credits! - (offer.kind === 'encounter' ? offer.entry.cost : 0));
      ok(crewIds.every(id => view().busyCrewIds.includes(id)));
      if (shipId === null) coverage.add('ship-free');
      if (offer.kind === 'encounter' && offer.entry.repeat.kind === 'once') {
        ok(!once.has(offer.entry.id), `Once-only repeated: ${offer.entry.id}`);
        once.add(offer.entry.id);
      }
      if ((turn === 0 && reloadPoint === 'scene') || policy.next() < 0.2) reload('scene');
      const prechoice = s.save();
      const choice = pick(view().choices).id;
      trail.push(`choice=${choice} crew=${crewIds.join(',')} ship=${shipId}`);
      s.act(choice);
      deepStrictEqual(s.save(), prechoice);
      const replay = (label: string) => {
        const saved = s.save();
        s = make(saved);
        deepStrictEqual(s.save(), prechoice);
        s.act(choice);
        coverage.add(`reload:${label}`);
        trail.push(`reload:${label}`);
      };
      if (policy.next() < 0.15) replay('staged');
      if (policy.next() < 0.1) {
        trail.push('odds/back');
        s.act('odds');
        ok(view().odds !== null);
        s.act('back');
        deepStrictEqual(s.save(), prechoice);
        s.act(choice);
        coverage.add('back');
      }
      const diceBefore = dice.getState();
      trail.push('try');
      s.act('try');
      if (view().choices.some(c => c.id === 'accept')) {
        deepStrictEqual(s.save(), prechoice);
        if (policy.next() < 0.15) {
          const rolled = view();
          dice = createSeededRng(diceBefore);
          replay('rolled');
          s.act('try');
          deepStrictEqual(view(), rolled);
        }
        const action = policy.next() < 0.5 ? 'edge' : 'accept';
        trail.push(action);
        coverage.add(action);
        s.act(action);
      }
      const lastRoll = view()
        .events.filter(e => e.type === 'roll')
        .at(-1)!;
      ok(lastRoll.type === 'roll');
      coverage.add(lastRoll.grade);
      const reward = view().cycle.edgeEarnedCrewIds;
      ok(new Set(reward).size === reward.length);
      const trustNotes = view().ledger.filter(n => n.command?.code === 'trustReward');
      ok(trustNotes.length <= 1, 'Repeated trust reward');
      if (view().crewTrust.priya === 3) {
        coverage.add('trust-reward');
        ok(reward.includes('priya') && trustNotes.length === 1);
      }
      ok(view().phase === 'hub' || view().ended);
    }
    ok(view().ended, 'Finale not reached within 40 public actions');
    ok(s.save().run.completed.includes('finale'));
    reload('ended');
    return coverage;
  } catch (error) {
    throw new Error(`SIM_SEED=${seed} SIM_MODE=${slice ? 'slice' : 'full'}\n${trail.join('\n')}\n${String(error)}`, {
      cause: error,
    });
  }
}

describe('seeded GameSession simulation', () => {
  it('completes 1,000 distinct seeds across full and slice seasons using public APIs', () => {
    // Reproduce with SIM_SEED=... SIM_MODE=full|slice; unset both for the complete cohort.
    const selectedSeed = process.env.SIM_SEED;
    ok(!process.env.SIM_MODE || ['full', 'slice'].includes(process.env.SIM_MODE), 'SIM_MODE must be full or slice');
    if (selectedSeed !== undefined)
      ok(/^\d+$/.test(selectedSeed) && Number(selectedSeed) <= 0xffffffff, 'SIM_SEED must be a uint32');
    for (const slice of [false, true]) {
      if (process.env.SIM_MODE && process.env.SIM_MODE !== (slice ? 'slice' : 'full')) continue;
      const covered = new Set<string>();
      const seeds =
        selectedSeed !== undefined
          ? [Number(selectedSeed)]
          : Array.from({ length: 500 }, (_, i) => i * 2 + Number(slice));
      for (const seed of seeds) for (const event of run(seed, slice)) covered.add(event);
      if (!process.env.SIM_SEED)
        for (const event of [
          'actions-spent',
          'cancel',
          'busy',
          'ship-free',
          'forced',
          'deadline',
          'gated',
          'early-lead',
          'clock-finale',
          'evidence-finale',
          'trust-reward',
          'edge',
          'back',
          'clean',
          'cost',
          'fail',
          'reload:hub',
          'reload:prepare',
          'reload:scene',
          'reload:staged',
          'reload:rolled',
          'reload:ended',
        ])
          expect(covered, `${slice ? 'slice' : 'full'} missing ${event}`).toContain(event);
    }
  }, 120_000);

  // Independent engine boundaries: deliberately infeasible inputs are outside the runnable session cohort.
  it('seed 77 distinguishes remaining unaffordable offers from an empty draw', () => {
    const fixedOffers = simulationEncounters.filter(entry =>
      ['first_crisis', 'lead_who', 'gated', 'stretch'].includes(entry.id),
    );
    const afterFirstAction = buildBoard(
      {
        cycle: 2,
        resources: { Credits: 51000 },
        ships: data.ships,
        crew: data.crew.filter(member => member.id !== 'priya'),
        gear: ['probe'],
        flags: { aid: true },
        played: [{ id: 'first_crisis', cycle: 2 }],
        encounters: fixedOffers,
      },
      createSeededRng(77),
    );
    expect(afterFirstAction.offers.map(entry => entry.id)).toEqual(['stretch']);
    expect(afterFirstAction.offers.filter(entry => entry.cost <= 51000)).toEqual([]);
  });

  it('reports an exhausted board and a hard-blocked due finale honestly', () => {
    const exhausted = buildBoard(
      {
        cycle: 2,
        resources: { Credits: 0 },
        ships: data.ships,
        crew: data.crew,
        gear: [],
        flags: {},
        played: [{ id: 'first_crisis', cycle: 1 }],
        encounters: [simulationEncounters[0]!],
      },
      createSeededRng(1),
    );
    expect(exhausted).toMatchObject({ status: 'no-eligible-offers', offers: [] });
    const blocked = scheduleKeystones({
      cycle: { ...newCycleState(data.rules), cycle: 9 },
      resources: { Credits: 0 },
      ships: data.ships,
      crew: data.crew,
      gear: [],
      flags: {},
      leads: [],
      completed: ['opening', 'middle_where', 'middle_who'],
      keystones: simulationKeystones.map(entry =>
        entry.id === 'finale' ? { ...entry, requires: { gear: ['missing'] } } : entry,
      ),
      roles: simulationRoles,
    });
    expect(blocked.offers.some(offer => offer.keystone.id === 'finale')).toBe(false);
    expect(blocked.blockedDue).toContain('finale');
  });
});

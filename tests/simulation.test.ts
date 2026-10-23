import { describe, expect, it } from 'vitest';
import { data, type Crew, type Encounter, type Keystone, type Ships } from '../src/data';
import { EncounterSchema, KeystoneSchema } from '../src/data/schema';
import { buildBoard } from '../src/engine/board';
import { assistOf, earnEdge, endCycle, newCycleState } from '../src/engine/cycle';
import { scheduleKeystones } from '../src/engine/keystones';
import { createSeededRng } from '../src/engine/rng';
import { addResource, makeRoll, newGameState, setupRoll, spendEdge } from '../src/engine/rules';
import { simulationEncounters, simulationKeystones, simulationRoles } from './simulation-fixtures';

type Candidate = { kind: 'encounter'; entry: Encounter } | { kind: 'keystone'; entry: Keystone; forced: boolean };

function run(seed: number, slice: boolean) {
  const rng = createSeededRng(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rng.next() * items.length)]!;
  const dice = (): [number, number] => [1 + Math.floor(rng.next() * 6), 1 + Math.floor(rng.next() * 6)];
  const ships = data.ships;
  let crew: Crew = data.crew.map(member => ({ ...member }));
  let cycle = newCycleState(data.rules, slice);
  let game = newGameState(data.rules);
  let gear = rng.next() < 0.5 ? ['probe'] : [];
  let flags = { aid: rng.next() < 0.5 };
  const completed: string[] = [];
  const leads: string[] = [];
  const played: { id: string; cycle: number }[] = [];
  const onceCompletions = new Set<string>();
  const trail: string[] = [];
  let phase = 'initial';
  let earlyLead = false;
  let clockFinale = false;
  let blockedDue = false;
  let sawGated = false;
  let passes = 0;

  try {
    for (let turn = 0; turn < 12 && !completed.includes('finale'); turn++) {
      phase = `cycle ${cycle.cycle} board`;
      const dueLead =
        !completed.includes('middle_where') && cycle.cycle <= 2
          ? 'middle_where'
          : !completed.includes('middle_who') && cycle.cycle <= 4
            ? 'middle_who'
            : undefined;
      const board = buildBoard(
        {
          cycle: cycle.cycle,
          resources: game.res,
          ships,
          crew,
          gear,
          flags,
          played,
          encounters: simulationEncounters,
          dueLead,
        },
        rng,
      );
      trail.push(`${phase}: ${board.offers.map(entry => entry.id).join(',')} unmet=${board.unmetGuarantees.join(',')}`);
      if (board.status !== 'ready' || board.offers.length === 0) throw new Error('Feasible board became empty');
      if (board.offers.some(entry => entry.id === 'gated')) sawGated = true;

      const busy = new Set<string>();
      const inService = new Map<string, Ships[number]>();
      for (let action = 0; action < data.rules.cycle.actions && !completed.includes('finale'); action++) {
        phase = `cycle ${cycle.cycle} action ${action + 1}`;
        const availableCrew = crew.filter(member => !busy.has(member.id));
        const schedule = scheduleKeystones({
          cycle,
          resources: game.res,
          ships,
          crew: availableCrew,
          gear,
          flags,
          leads,
          completed,
          keystones: simulationKeystones,
          roles: simulationRoles,
        });
        blockedDue ||= schedule.blockedDue.length > 0;
        const full = cycle.pursuit.value === cycle.pursuit.length;
        if (full && completed.includes('opening') && !completed.includes('finale')) {
          clockFinale = true;
          if (!schedule.offers.some(offer => offer.keystone.id === 'finale' && offer.forced))
            throw new Error('Full Pursuit did not force the finale');
        }
        const due = !completed.includes('opening')
          ? ['opening']
          : full
            ? ['finale']
            : [...simulationRoles.middleIds, 'finale'];
        for (const id of due) {
          const key = simulationKeystones.find(entry => entry.id === id)!;
          if (
            cycle.cycle >= key.deadline &&
            !completed.includes(id) &&
            !schedule.offers.some(offer => offer.keystone.id === id && offer.forced) &&
            !schedule.blockedDue.includes(id)
          )
            throw new Error(`Deadline disappeared: ${id}`);
        }
        for (const offer of schedule.offers)
          if (offer.keystone.id.startsWith('middle_') && cycle.cycle < (offer.keystone.availableWhen.cycle ?? 0))
            earlyLead = true;

        // Revalidate the fixed Hub offers after action one without consuming the policy RNG.
        const currentBoard = buildBoard(
          {
            cycle: cycle.cycle,
            resources: game.res,
            ships,
            crew: availableCrew,
            gear,
            flags,
            played,
            encounters: board.offers,
          },
          createSeededRng(rng.getState()),
        );
        const options: Candidate[] = [
          ...currentBoard.offers.map(entry => ({ kind: 'encounter' as const, entry })),
          ...schedule.offers.map(offer => ({ kind: 'keystone' as const, entry: offer.keystone, forced: offer.forced })),
        ];
        const legal = options.filter(
          option =>
            availableCrew.length > 0 && (option.kind === 'keystone' || option.entry.cost <= (game.res.Credits ?? 0)),
        );
        const forced = legal.filter(option => option.kind === 'keystone' && option.forced);
        if (legal.length === 0) {
          passes++;
          trail.push(`${phase}: pass (fixed board has no currently legal action)`);
          cycle = { ...cycle, actionsLeft: cycle.actionsLeft - 1 };
          continue;
        }
        const candidate = pick(forced.length ? forced : legal);
        cycle = { ...cycle, actionsLeft: cycle.actionsLeft - 1 };

        const member = candidate.entry.requires.crew?.length
          ? availableCrew.find(value => value.id === candidate.entry.requires.crew![0])!
          : pick(availableCrew);
        const eligibleShips = ships.filter(ship =>
          candidate.entry.requires.shipTag ? ship.tags.includes(candidate.entry.requires.shipTag) : true,
        );
        const ship = pick(eligibleShips);
        busy.add(member.id);
        inService.set(ship.id, ship);
        if (candidate.kind === 'encounter') {
          if (candidate.entry.repeat.kind === 'once') {
            if (onceCompletions.has(candidate.entry.id)) throw new Error(`Once-only repeated: ${candidate.entry.id}`);
            onceCompletions.add(candidate.entry.id);
          }
          played.push({ id: candidate.entry.id, cycle: cycle.cycle });
          addResource(game.res, data.rules, 'Credits', -candidate.entry.cost);
        } else completed.push(candidate.entry.id);

        const assist = assistOf(member, member.trust, data.rules);
        const basic = setupRoll(
          data.character,
          data.rules,
          { skills: [assist.skill], target: data.rules.defaultTarget, bonuses: [] },
          () => false,
        );
        const setup = {
          ...basic,
          mod: basic.mod + assist.n,
          parts: [...basic.parts, { label: member.name, n: assist.n }],
        };
        let result = makeRoll(setup, data.rules, dice);
        if (result.grade !== 'clean' && (game.res.Edge ?? 0) > 0 && rng.next() < 0.3) {
          result = spendEdge(result, setup, data.rules, dice);
          addResource(game.res, data.rules, 'Edge', -1);
        }
        if (result.grade === 'clean') addResource(game.res, data.rules, 'Renown', 1);
        if (result.grade === 'fail') addResource(game.res, data.rules, 'Strain', 1);
        if (candidate.kind === 'encounter') {
          if (result.grade !== 'fail') addResource(game.res, data.rules, 'Credits', 1500);
          if (candidate.entry.lead && result.grade !== 'fail' && !leads.includes(candidate.entry.lead))
            leads.push(candidate.entry.lead);
          if (candidate.entry.id === 'gated' && result.grade === 'clean') flags = { aid: true };
        }
        if (result.grade !== 'fail' && member.trust < 3) {
          crew = crew.map(value => (value.id === member.id ? { ...value, trust: value.trust + 1 } : value));
          const reward = earnEdge(cycle, game, member, crew.find(value => value.id === member.id)!.trust, data.rules);
          cycle = reward.cycle;
          game = reward.game;
        }
        if (result.grade === 'clean' && gear.length === 0 && rng.next() < 0.3) gear = ['probe'];
        trail.push(
          `${phase}: ${candidate.entry.id} crew=${member.id} ship=${ship.id} ${result.grade} pursuit=${cycle.pursuit.value}`,
        );
      }
      if (completed.includes('finale')) break;
      phase = `cycle ${cycle.cycle} end`;
      if (cycle.actionsLeft !== 0) throw new Error(`Expected zero actions left, got ${cycle.actionsLeft}`);
      const advance = endCycle(
        cycle,
        game,
        [...inService.values()],
        { loud: rng.next() < 0.25, quiet: rng.next() < 0.25 },
        data.rules,
      );
      cycle = advance.cycle;
      game = advance.game;
      if (cycle.actionsLeft !== data.rules.cycle.actions) throw new Error('endCycle did not reset actions');
      trail.push(`${phase}: pursuit=${cycle.pursuit.value}/${cycle.pursuit.length} credits=${game.res.Credits}`);
    }
    if (!completed.includes('finale')) throw new Error('Finale not reached by cycle 12');
    return { earlyLead, clockFinale, blockedDue, sawGated, passes };
  } catch (error) {
    throw new Error(`seed=${seed} slice=${slice} phase=${phase}\n${trail.join('\n')}\n${String(error)}`);
  }
}

describe('seeded cycle simulation', () => {
  it('validates the synthetic catalog against current schemas', () => {
    for (const entry of simulationEncounters) expect(EncounterSchema.parse(entry)).toEqual(entry);
    for (const entry of simulationKeystones) expect(KeystoneSchema.parse(entry)).toEqual(entry);
  });

  it('completes 1,000 seeded full and slice runs with legal offers and deadlines', () => {
    let lead = 0,
      clock = 0,
      blocked = 0,
      gated = 0,
      passes = 0;
    for (let seed = 0; seed < 1000; seed++) {
      const result = run(seed, seed % 2 === 1);
      lead += Number(result.earlyLead);
      clock += Number(result.clockFinale);
      blocked += Number(result.blockedDue);
      gated += Number(result.sawGated);
      passes += result.passes;
    }
    expect(Math.min(lead, clock, blocked, gated)).toBeGreaterThan(0);
    expect(passes).toBeGreaterThan(0);
  }, 30_000);

  it('seed 77 can pass its second action after assigning the only required crew', () => {
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
    expect(run(77, true)).toBeTruthy();
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

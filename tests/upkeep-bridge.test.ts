import { Compiler } from 'inkjs/full';
import { readFileSync } from 'node:fs';
import { assistedSetup } from '../src/bridge/roll';
import type { SaveData } from '../src/bridge/types';
import type { GameData } from '../src/data';
import { describe, expect, it } from 'vitest';
import { RunController } from '../src/bridge/run';
import { GameSession } from '../src/bridge/session';
import { newGameState } from '../src/engine/rules';
import { storyData } from './helpers';
import ink from '../src/story/main.ink';
import { commandText, noteText } from '../src/ui/strings';

describe('upkeep bridge projection', () => {
  it.each([0, 1, 2, 3])('previews and commits one miss at arrears %s without changing preview inputs', arrears => {
    const run = new RunController(storyData, { seed: 17 });
    run.state.cycle.arrears = arrears;
    run.state.cycle.pursuit.value = 5;
    const game = newGameState(storyData.rules);
    game.res = { ...game.res, Credits: 100, Renown: 3, Strain: 5 };
    const before = structuredClone({ state: run.state, game });
    const preview = run.preview(game);
    expect(preview).toEqual({
      upkeepDue: 4000,
      upkeepPaid: 100,
      upkeepShortfall: 3900,
      arrearsBefore: arrears,
      arrearsAfter: arrears + 1,
      renownLost: 1,
      strainAdded: 0,
      pursuitDelta: 1,
      warning: arrears === 1 || arrears === 2,
      failed: arrears === 3,
    });
    expect(run.preview(game)).toEqual(preview);
    expect({ state: run.state, game }).toEqual(before);
    const committed = run.end(game, {});
    expect(committed.projection).toEqual(preview);
    expect(committed.game.res).toMatchObject({ Credits: 0, Renown: 2, Strain: 5 });
    expect(run.state.cycle).toMatchObject({ cycle: 2, arrears: arrears + 1, upkeepShortfall: 3900 });
  });

  it('uses pre-settlement Renown for Pursuit and actual resource clamps', () => {
    const run = new RunController(storyData, {});
    const game = newGameState(storyData.rules);
    game.res.Credits = 0;
    game.res.Renown = 3;
    expect(run.preview(game)).toMatchObject({ renownLost: 1, pursuitDelta: 2 });
    game.res.Renown = 0;
    expect(run.preview(game)).toMatchObject({ renownLost: 0, pursuitDelta: 1 });
    game.res.Credits = 4000;
    run.state.cycle.arrears = 2;
    expect(run.end(game, {}).projection).toMatchObject({
      upkeepPaid: 4000,
      upkeepShortfall: 0,
      arrearsBefore: 2,
      arrearsAfter: 1,
      renownLost: 0,
      strainAdded: 0,
      warning: false,
    });
  });

  it('shows the bill before commitment and saves the exact settlement ledger across reload', () => {
    const initial = new GameSession({ data: storyData, inkJson: ink, seed: 17 }).save();
    initial.res.Credits = 100;
    initial.run.cycle.arrears = 1;
    const session = new GameSession({ data: storyData, inkJson: ink, saved: initial });
    const before = session.save();
    const command = session.store.getState().choices.find(c => c.id === 'endCycle')!.command!;
    expect(command.code).toBe('endCycle');
    expect(commandText(command).sub).toContain('shortfall Cr3900');
    expect(commandText(command).sub).toContain('Warning:');
    expect(session.save()).toEqual(before);
    session.endCycle();
    const saved = session.save();
    const note = session.store.getState().ledger.at(-1)!;
    expect(note.command).toMatchObject({
      code: 'upkeepSettlement',
      settlement: {
        upkeepPaid: 100,
        arrearsBefore: 1,
        arrearsAfter: 2,
        renownLost: 0,
        strainAdded: 1,
      },
    });
    expect(noteText(note)).toContain('Renown −0; Strain +1');
    const loaded = new GameSession({ data: storyData, inkJson: ink, saved: JSON.parse(JSON.stringify(saved)) });
    expect(loaded.save()).toEqual(saved);
    expect(loaded.store.getState().ledger).toEqual(session.store.getState().ledger);
  });
});

const rollInk = new Compiler(
  readFileSync('src/story/lib/world.ink', 'utf8') +
    '\n' +
    readFileSync('src/story/lib/roll.ink', 'utf8') +
    `
-> END
=== upkeep_test ===
+ [Check]
    -> roll("Diplomat", 8, "", -> done, -> done, -> done)
=== done ===
-> scene_end
`,
)
  .Compile()
  .ToJson()!;
const rollData = (required: boolean): GameData => ({
  ...storyData,
  encounters: [
    { ...storyData.encounters[0]!, knot: 'upkeep_test', cost: 10, requires: required ? { shipTag: 'fast' } : {} },
  ],
});
const sessionFor = (required = true, knot = 'upkeep_test') => {
  const data = rollData(required);
  data.encounters[0]!.knot = knot;
  const initial = new GameSession({ data, inkJson: rollInk, seed: 17 }).save();
  initial.run.cycle.arrears = 2;
  initial.res.Credits = 100;
  return { data, session: new GameSession({ data, inkJson: rollInk, saved: initial }) };
};
const stage = (s: GameSession) => {
  s.act(0);
  s.act('odds');
  return s.store.getState().odds!;
};

describe('required-ship arrears target', () => {
  it.each([0, 1, 2, 3])('adds a flat target increase at arrears %s only for the matching required ship', arrears => {
    const run = new RunController(rollData(true), {});
    run.state.active = { kind: 'encounter', entry: rollData(true).encounters[0]!, forced: false, weak: false };
    run.state.cycle.arrears = arrears;
    const request = { skills: ['Diplomat'], target: 8, bonuses: [] };
    const setup = () => assistedSetup(rollData(true), request, () => false, [], run.state.crewTrust, run.state);
    for (const shipId of [null, 'ardent_venture', 'errant_pawn']) {
      run.state.assignments.shipId = shipId;
      const result = setup();
      const n = arrears >= 1 && shipId === 'errant_pawn' ? 1 : 0;
      expect(result.target).toBe(8 + n);
      expect(result.mod).toBe(3);
      expect(result.targetAdjustment).toEqual(n ? { code: 'upkeepArrears', n: 1, arrears } : undefined);
    }
    run.state.active.entry.requires = {};
    expect(setup().target).toBe(8);
  });

  it.each([true, false])('keeps Back, staged saves, reload, charges and RNG exact (required=%s)', required => {
    const { data, session: s } = sessionFor(required);
    s.pickOffer('written_clause');
    s.assign({ shipId: 'errant_pawn', crewIds: [] });
    const preparation = s.save();
    s.confirm();
    const before = s.save();
    expect(before.res.Credits).toBe(90);
    expect(before.run.cycle.actionsLeft).toBe(preparation.run.cycle.actionsLeft - 1);
    const odds = stage(s);
    expect(odds.target).toBe(required ? 9 : 8);
    expect(odds.mod).toBe(3);
    expect(odds.targetAdjustment?.n).toBe(required ? 1 : undefined);
    expect(s.save()).toEqual(before);
    s.act('back');
    expect(s.save()).toEqual(before);
    expect(stage(s)).toEqual(odds);
    const loaded = new GameSession({ data, inkJson: rollInk, saved: s.save() });
    expect(stage(loaded)).toEqual(odds);
    s.act('try');
    loaded.act('try');
    expect(loaded.store.getState().events).toEqual(s.store.getState().events);
    expect(loaded.save()).toEqual(s.save());
    expect(s.store.getState().cycle.arrears).toBe(2);
    expect(s.store.getState().res.Credits).toBe(90);
  });

  it.each([true, false])('grades a boundary total with the displayed target (required=%s)', required => {
    const { data, session } = sessionFor(required);
    const s = new GameSession({ data, inkJson: rollInk, saved: session.save(), rng: () => [2, 3] });
    s.pickOffer('written_clause');
    s.assign({ shipId: 'errant_pawn', crewIds: [] });
    s.confirm();
    expect(stage(s).target).toBe(required ? 9 : 8);
    s.act('try');
    expect(
      s.store
        .getState()
        .events.filter(e => e.type === 'roll')
        .at(-1),
    ).toMatchObject({
      total: 8,
      mod: 3,
      grade: required ? 'fail' : 'cost',
    });
  });

  it('rolls back a failed confirmation without charges, counter or RNG changes', () => {
    const { session: s } = sessionFor(true, 'missing_knot');
    s.pickOffer('written_clause');
    s.assign({ shipId: 'errant_pawn', crewIds: [] });
    const before = s.save();
    expect(() => s.confirm()).toThrow();
    expect(s.save()).toEqual(before);
  });

  it('Edge rerolls against the same increased target, leaving counters and charges alone', () => {
    const { data, session: initial } = sessionFor();
    const saved: SaveData = initial.save();
    let calls = 0;
    const s = new GameSession({ data, inkJson: rollInk, saved, rng: () => (++calls === 1 ? [1, 1] : [3, 4]) });
    s.pickOffer('written_clause');
    s.assign({ shipId: 'errant_pawn', crewIds: [] });
    s.confirm();
    const before = s.save();
    expect(stage(s).target).toBe(9);
    s.act('try');
    expect(
      s.store
        .getState()
        .events.filter(e => e.type === 'roll')
        .at(-1),
    ).toMatchObject({ grade: 'fail' });
    expect(s.save()).toEqual(before);
    s.act('edge');
    expect(calls).toBe(2);
    expect(
      s.store
        .getState()
        .events.filter(e => e.type === 'roll')
        .at(-1),
    ).toMatchObject({ total: 10, mod: 3, grade: 'cost' });
    expect(s.store.getState().cycle.arrears).toBe(2);
    expect(s.store.getState().res).toMatchObject({ Credits: 90, Edge: 2 });
  });
});

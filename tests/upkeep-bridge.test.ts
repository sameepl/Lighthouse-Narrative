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

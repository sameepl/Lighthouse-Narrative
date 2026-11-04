import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/bridge/session';
import { RunController } from '../src/bridge/run';
import { runChoices } from '../src/bridge/run-choices';
import { preparationError, preparationProjection } from '../src/bridge/view';
import { newGameState } from '../src/engine/rules';
import { storyData } from './helpers';
import inkJson from '../src/story/main.ink';

const fixture = () => {
  const data = structuredClone(storyData);
  data.encounters[0]!.requires = {};
  data.encounters[0]!.cost = 10;
  const run = new RunController(data, { seed: 17 });
  const game = newGameState(data.rules);
  run.refresh(game, {});
  const project = () => preparationProjection(run.state, data, game.res);
  return { data, run, game, project };
};

describe('preparation projection', () => {
  it('keeps Board affordability locks and prepare reasons in parity with confirmation', () => {
    const { data, run, game, project } = fixture();
    game.res.Credits = 0;
    expect(project().offerLocks).toEqual([
      {
        offerId: 'written_clause',
        reasons: [{ code: 'insufficientCredits', required: 10, available: 0 }],
      },
    ]);
    expect(runChoices(run.state, data, game.res)[0]!.command).toMatchObject({ locked: true });
    run.pick('written_clause'); // Existing selection policy allows preparation of locked offers.
    const before = structuredClone({ state: run.state, game });
    expect(project().preparation!.reasons).toEqual(project().offerLocks[0]!.reasons);
    expect(() => run.confirm(game)).toThrow('Insufficient Credits');
    expect({ state: run.state, game }).toEqual(before);
    game.res.Credits = 10;
    expect(project().preparation).toMatchObject({ ready: true, reasons: [], shipRequirement: { kind: 'optional' } });
    expect(runChoices(run.state, data, game.res).some(c => c.id === 'confirm')).toBe(true);
    run.confirm(game);
    expect(run.state.phase).toBe('scene');
    expect(game.res.Credits).toBe(0);
  });

  it('explains required crew/ship and unsuitable selections without restricting assignment', () => {
    const { data, run, game, project } = fixture();
    run.state.offers[0]!.entry.requires = { crew: ['priya'], shipTag: 'fast' };
    run.pick('written_clause');
    expect(project().preparation).toMatchObject({
      ready: false,
      shipRequirement: { kind: 'required', tag: 'fast' },
      reasons: [
        { code: 'requiredShip', shipTag: 'fast' },
        { code: 'requiredCrew', crewId: 'priya' },
      ],
    });
    expect(() => run.confirm(game)).toThrow('Assign a suitable ship');
    run.assign({ shipId: 'ardent_venture', crewIds: ['priya'] });
    expect(project().preparation!.reasons).toEqual([
      { code: 'unsuitableShip', shipId: 'ardent_venture', shipTag: 'fast' },
    ]);
    run.assign({ shipId: 'errant_pawn', crewIds: [] });
    expect(() => run.confirm(game)).toThrow('Assign the required crew');
    run.assign({ shipId: 'errant_pawn', crewIds: ['priya'] });
    expect(project().preparation!.ships[0]).toMatchObject({ selected: true, tags: data.ships[0]!.tags, upkeep: 1000 });
    expect(project().preparation!.crew.find(c => c.crewId === 'priya')!.assigned).toBe(true);
    expect(project().preparation!.ready).toBe(true);
    run.confirm(game);
  });

  it('exposes current trust, engine assist, busy and protected crew and preserves every validation check', () => {
    const { data, run, game, project } = fixture();
    run.pick('written_clause');
    run.state.busyCrewIds = ['priya'];
    run.state.crewTrust.priya = 3;
    expect(project().preparation!.crew.find(c => c.crewId === 'priya')).toMatchObject({
      assist: { skill: 'Diplomat', n: 2 },
      trust: 3,
      busy: true,
      assignable: true,
      assigned: false,
    });
    expect(project().preparation!.crew.find(c => c.crewId === 'renata')).toMatchObject({
      assignable: false,
      busy: false,
    });
    for (const value of [
      { shipId: 'missing', crewIds: [] },
      { shipId: null, crewIds: ['tally', 'tally'] },
      { shipId: null, crewIds: ['priya'] },
      { shipId: null, crewIds: ['renata'] },
    ]) {
      expect(() => run.assign(value)).toThrow();
      run.state.assignments = value; // Corrupt state verifies confirmation revalidates, too.
      const reasons = project().preparation!.reasons;
      expect(project().preparation!.ready).toBe(false);
      expect(() => run.confirm(game)).toThrow(preparationError(reasons[0]!));
    }
    run.state.assignments = { shipId: null, crewIds: [] };
    run.state.cycle.actionsLeft = 0;
    expect(project().preparation!.reasons).toEqual([{ code: 'noActionsLeft' }]);
    expect(runChoices(run.state, data, game.res).some(c => c.id === 'confirm')).toBe(false);
    expect(() => run.confirm(game)).toThrow('No actions left');
  });

  it('publishes detached snapshots, cancels cleanly and reads without changing save, catalog or RNG', () => {
    const { data, run, game, project } = fixture();
    run.pick('written_clause');
    const before = structuredClone({ state: run.state, data, game });
    const projection = project();
    project();
    expect({ state: run.state, data, game }).toEqual(before);
    projection.active!.entry.requires.crew = ['bad'];
    projection.preparation!.crew[0]!.assist.n = 999;
    projection.preparation!.ships[0]!.tags.push('bad');
    projection.offerLocks[0]!.reasons.push({ code: 'noActionsLeft' });
    expect({ state: run.state, data, game }).toEqual(before);
    const session = new GameSession({ data, inkJson, seed: 17 });
    session.pickOffer('written_clause');
    const saved = session.save();
    const view = session.store.getState();
    view.active!.entry.title = 'Changed';
    view.preparation!.crew[0]!.assist.n = 999;
    view.preparation!.ships[0]!.tags.push('bad');
    expect(session.save()).toEqual(saved);
    session.cancelPrepare();
    expect(session.store.getState()).toMatchObject({ active: null, preparation: null, phase: 'hub' });
    expect(session.save()).toMatchObject({
      res: saved.res,
      run: { rngState: saved.run.rngState, assignments: { shipId: null, crewIds: [] } },
    });
    expect(session.store.getState().odds).toBeNull();
  });
});

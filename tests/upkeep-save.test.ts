import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/bridge/session';
import { data } from '../src/data';
import { endCycle, newCycleState } from '../src/engine/cycle';
import { newGameState } from '../src/engine/rules';
import inkJson from '../src/story/main.ink';

const rules = data.rules;
const sessionData = { ...data, keystones: [], season: { status: 'unconfigured' as const } };
const due = data.ships.reduce((sum, ship) => sum + ship.upkeep, 0);

describe('upkeep cycle and save integration', () => {
  it('bills the current two catalog ships and uses pre-burn Renown for Pursuit', () => {
    expect(data.ships).toHaveLength(2);
    const game = newGameState(rules);
    game.res.Credits = 100;
    game.res.Renown = rules.cycle.pursuit.renownThreshold;
    const cycle = newCycleState(rules);
    const original = structuredClone({ game, cycle });
    const result = endCycle(cycle, game, data.ships, {}, rules);
    expect(result.report).toMatchObject({
      upkeep: 100,
      upkeepDue: due,
      pursuitDelta: rules.cycle.pursuit.base + rules.cycle.pursuit.renownDelta,
    });
    expect(result.cycle).toMatchObject({ arrears: 1, upkeepShortfall: due - 100, failed: false });
    expect(result.game.res.Renown).toBe(game.res.Renown - rules.cycle.upkeep.renownLoss);
    expect({ game, cycle }).toEqual(original);
    result.game.res.Credits = due;
    const paid = endCycle(result.cycle, result.game, data.ships, {}, rules);
    expect(paid.cycle).toMatchObject({ arrears: 0, upkeepShortfall: 0, failed: false });
    expect(paid.game.res.Credits).toBe(0);
  });

  it('roundtrips escalating misses and foreclosure without consuming RNG on restore', () => {
    let session = new GameSession({ inkJson, data: sessionData, seed: 57 });
    const initial = session.save();
    initial.res.Credits = 0;
    session = new GameSession({ inkJson, data: sessionData, saved: initial });
    let strain = initial.res.Strain!;
    for (let arrears = 1; arrears <= rules.cycle.upkeep.arrearsLimit; arrears++) {
      session.endCycle();
      const saved = session.save();
      const failed = arrears === rules.cycle.upkeep.arrearsLimit;
      if (arrears >= rules.cycle.upkeep.strainFrom)
        strain = Math.min(rules.resources.Strain!.max!, strain + rules.cycle.upkeep.strainGain);
      expect(saved.run.cycle).toMatchObject({ arrears, upkeepShortfall: due, failed });
      expect(saved.res.Strain).toBe(strain);
      expect(saved.run.ending).toBe(failed ? 'foreclosure' : null);
      expect(saved.run.phase).toBe(failed ? 'ended' : 'hub');
      const restored = new GameSession({ inkJson, data: sessionData, saved: JSON.parse(JSON.stringify(saved)) });
      expect(restored.save()).toEqual(saved);
      session = restored;
    }
    const final = session.save();
    expect(() => session.endCycle()).toThrow('Action requires hub phase');
    expect(session.save()).toEqual(final);
  });

  it('rejects inconsistent failure counters and endings', () => {
    const valid = new GameSession({ inkJson, data: sessionData }).save();
    for (const patch of [
      { arrears: rules.cycle.upkeep.arrearsLimit + 1 },
      { arrears: rules.cycle.upkeep.arrearsLimit },
      { failed: true },
      { failed: 'false' },
    ]) {
      const broken = structuredClone(valid);
      Object.assign(broken.run.cycle, patch);
      expect(() => new GameSession({ inkJson, data: sessionData, saved: broken })).toThrow();
    }
    const broken = structuredClone(valid);
    broken.run.ending = 'foreclosure';
    expect(() => new GameSession({ inkJson, data: sessionData, saved: broken })).toThrow();
  });
});

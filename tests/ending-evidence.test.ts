import { expect, it } from 'vitest';
import { GameSession } from '../src/bridge/session';
import { data } from '../src/data';
import inkJson from '../src/story/main.ink';

function start(id: string, dice: [number, number] = [6, 6]) {
  const initial = new GameSession({ data, inkJson });
  const save = initial.save();
  const entry = data.keystones.find(k => k.id === id)!;
  save.run.cycle.cycle = 2;
  save.run.completed = ['slice_k1_passenger'];
  save.run.offers = [{ kind: 'keystone', entry, forced: false, weak: false }];
  const s = new GameSession({ data, inkJson, saved: save, rng: () => dice });
  s.pickOffer(id);
  s.confirm();
  return s;
}
function choose(s: GameSession, index: number) {
  s.act(s.store.getState().choices[index]!.id);
  s.act('try');
  if (s.store.getState().choices.some(c => c.id === 'accept')) s.act('accept');
}

it('projects only completed evidence and distinguishes recovered manifest from a header on real rescue paths', () => {
  expect(new GameSession({ data, inkJson }).store.getState().evidence).toEqual([]);
  for (const [rescue, dice, variant] of [
    [0, [6, 6], 'header'],
    [1, [6, 6], 'copy'],
    [1, [1, 1], 'header'],
  ] as const) {
    const s = start('slice_k2_hab', [...dice]);
    expect(s.store.getState().evidence).toEqual([]);
    choose(s, 0);
    expect(s.store.getState().evidence).toEqual([]);
    const resumed = new GameSession({ data, inkJson, saved: s.save(), rng: () => [...dice] });
    expect(resumed.store.getState().evidence).toEqual([]);
    choose(resumed, rescue);
    const expected = [{ id: 'six', variant }];
    expect(resumed.store.getState().evidence).toEqual(expected);
    const saved = resumed.save();
    expect(Object.hasOwn(saved, 'evidence')).toBe(false);
    const restored = new GameSession({ data, inkJson, saved });
    expect(restored.store.getState().evidence).toEqual(expected);
    expect(restored.save()).toEqual(saved);
    resumed.store.getState().evidence.splice(0);
    expect(new GameSession({ data, inkJson, saved: resumed.save() }).store.getState().evidence).toEqual(expected);
    restored.restart();
    expect(restored.store.getState().evidence).toEqual([]);
  }
});

it('retains acquired removal evidence through foreclosure and an ended-save reload', () => {
  const s = start('slice_k3_lane');
  choose(s, 1);
  expect(s.store.getState().evidence).toEqual([{ id: 'removed' }]);
  const saved = s.save();
  saved.res.Credits = 0;
  saved.run.cycle.arrears = data.rules.cycle.upkeep.arrearsLimit - 1;
  const ending = new GameSession({ data, inkJson, saved });
  ending.endCycle();
  expect(ending.store.getState()).toMatchObject({ ended: true, evidence: [{ id: 'removed' }] });
  const restored = new GameSession({ data, inkJson, saved: ending.save() });
  expect(restored.store.getState().evidence).toEqual([{ id: 'removed' }]);
});

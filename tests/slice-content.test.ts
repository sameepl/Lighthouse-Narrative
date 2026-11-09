import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/bridge/session';
import type { SaveData } from '../src/bridge/types';
import type { Dice, Grade } from '../src/engine/types';
import { data } from '../src/data';
import inkJson from '../src/story/main.ink';

function roles() {
  if (data.season.status !== 'configured') throw Error('Slice not activated');
  return data.season.slice;
}
function runner(saved?: SaveData) {
  let dice: Dice = [6, 6];
  const s = new GameSession({ data, inkJson, saved, slice: true, rng: () => dice });
  return {
    s,
    grade(grade: Grade) {
      s.act('odds');
      const odds = s.store.getState().odds!;
      const sum = odds.target - odds.mod + (grade === 'clean' ? data.rules.cleanMargin : grade === 'fail' ? -1 : 0);
      expect(sum).toBeGreaterThanOrEqual(2);
      expect(sum).toBeLessThanOrEqual(12);
      dice = [Math.floor(sum / 2), Math.ceil(sum / 2)];
      s.act('try');
      if (s.store.getState().choices.some(c => c.id === 'accept')) s.act('accept');
    },
  };
}
function complete(r: ReturnType<typeof runner>, choices: number[], grade: Grade = 'clean') {
  let i = 0;
  for (let depth = 0; r.s.store.getState().phase === 'scene'; depth++) {
    expect(depth).toBeLessThan(10);
    const view = r.s.store.getState();
    if (view.choices.some(c => c.id === 'try')) r.grade(grade);
    else r.s.act(view.choices.filter(c => typeof c.id === 'number')[choices[i++] ?? 0]!.id);
  }
}
function entry(id: string, credits = 52000, full = false) {
  const key = data.keystones.find(k => k.id === id)!;
  const save = runner().s.save();
  save.res.Credits = credits;
  save.res.Strain = 2;
  save.res.Renown = 1;
  save.run.cycle.cycle = key.deadline;
  save.run.cycle.pursuit.value = full ? save.run.cycle.pursuit.length : 0;
  save.run.completed =
    id === roles().firstId ? [] : id === roles().finaleId ? [roles().firstId, ...roles().middleIds] : [roles().firstId];
  save.run.offers = [{ kind: 'keystone', entry: key, forced: true, weak: full }];
  const r = runner(save);
  r.s.pickOffer(id);
  r.s.confirm();
  return r;
}
type Path = (number | Grade)[];
function expected(id: string, path: Path) {
  const a = path[0] as number,
    g = ['clean', 'cost', 'fail'].indexOf(path[1] as string);
  const delta = { Credits: 0, Renown: 0, Strain: 0, Pursuit: 0 };
  if (id === roles().firstId) {
    if (a === 0) {
      delta.Credits = g === 1 ? -1000 : 0;
      delta.Strain = [-1, 0, 1][g]!;
    }
    if (a === 1) {
      delta.Credits = [1500, 500, -500][g]!;
      delta.Strain = g === 1 ? 1 : 0;
    }
    if (a === 2) {
      delta.Pursuit = 1;
      delta.Credits = g === 1 ? -500 : 0;
      delta.Renown = g === 0 ? 1 : 0;
      delta.Strain = g === 2 ? 1 : 0;
    }
  } else if (id === roles().middleIds[0]) {
    const b = path[2] as number,
      h = ['clean', 'cost', 'fail'].indexOf(path[3] as string);
    delta.Credits =
      [
        [1500, -1000, -500],
        [0, -1500, -500],
        [1000, -500, -1500],
      ][a]![g]! +
      ([
        [0, -1000, -500],
        [1500, -1500, -500],
        [1000, -1000, -1500],
      ][b]?.[h] ?? 0);
    delta.Pursuit = a === 1 ? 1 : 0;
    delta.Renown = Number(a === 1 && g === 0) + Number(b === 0 && h === 0);
  } else if (id === roles().middleIds[1]) {
    delta.Credits = [
      [0, -500, -500],
      [1000, -500, -1000],
      [1500, -1000, -500],
    ][a]![g]!;
    delta.Pursuit = a === 0 ? 1 : 0;
    delta.Renown = a === 0 && g === 0 ? 1 : 0;
  } else
    delta.Credits = [
      [1000, -500, -1000],
      [1500, -1000, -500],
    ][a]![g]!;
  return delta;
}

// Before #90 lands the production catalog is deliberately unconfigured. Once
// activated, every assertion below uses that real catalog and compiled story.
describe.skipIf(data.season.status === 'unconfigured')('activated slice content', () => {
  it('walks all 111 grade/choice paths with exact effects, flags and roll counts', () => {
    expect(roles()).toMatchObject({
      tutorialId: 'written_clause',
      firstId: 'slice_k1_passenger',
      middleIds: ['slice_k2_hab', 'slice_k3_lane'],
      finaleId: 'slice_k5_asking',
      minCompletedMiddle: 2,
    });
    const keys = [roles().firstId, ...roles().middleIds, roles().finaleId].map(id =>
      data.keystones.find(k => k.id === id),
    );
    expect(keys.every(Boolean)).toBe(true);
    let total = 0;
    for (const key of keys as typeof data.keystones)
      for (const full of key.id === roles().finaleId ? [false, true] : [false]) {
        const start = entry(key.id, 52000, full).s.save(),
          queue: Path[] = [[]];
        let paths = 0;
        while (queue.length) {
          const path = queue.pop()!;
          expect(path.length).toBeLessThan(8);
          const r = runner(start);
          for (const op of path) {
            if (typeof op === 'number') r.s.act(op);
            else r.grade(op);
          }
          const view = r.s.store.getState();
          if (key.id === roles().middleIds[0] && path.length === 2) {
            const beat = expected(key.id, path);
            for (const name of ['Credits', 'Renown', 'Strain'] as const)
              expect(view.res[name]! - start.res[name]!).toBe(beat[name]);
            expect(view.cycle.pursuit.value - start.run.cycle.pursuit.value).toBe(beat.Pursuit);
            expect(view.events.filter(e => e.type === 'roll')).toHaveLength(1);
            expect(runner(r.s.save()).s.store.getState().res).toEqual(view.res);
          }
          if (view.phase !== 'scene') {
            paths++;
            const delta = expected(key.id, path),
              flags = JSON.parse(r.s.save().ink).variablesState;
            for (const name of ['Credits', 'Renown', 'Strain'] as const)
              expect(view.res[name]! - start.res[name]!, `${key.id}:${path}:${name}`).toBe(delta[name]);
            expect(view.cycle.pursuit.value - start.run.cycle.pursuit.value).toBe(delta.Pursuit);
            expect(view.events.filter(e => e.type === 'roll')).toHaveLength(key.id === roles().middleIds[0] ? 2 : 1);
            for (const event of view.events) if (event.type === 'para') expect(event.html).toMatch(/^\[STUB\]/);
            if (key.id === roles().middleIds[0]) {
              expect(Boolean(flags.k2_records_saved)).toBe(
                (path[2] === 1 && path[3] !== 'fail') || (path[2] === 2 && path[3] === 'clean'),
              );
              expect(Boolean(flags.k2_people_first)).toBe(path[2] === 0);
            }
            if (key.id === roles().middleIds[1])
              expect(Boolean(flags.k3_published)).toBe(path[0] === 0 && path[1] !== 'fail');
            if (key.id === roles().finaleId) {
              expect(view.ended).toBe(true);
              expect(Boolean(flags.k5_request_kept)).toBe(path[0] === 0);
              expect(view.bg).toBe(path[0] === 0 ? 'end_closed' : 'end_open');
            }
          } else if (view.choices.some(c => c.id === 'try'))
            for (const grade of ['clean', 'cost', 'fail'] as const) queue.push([...path, grade]);
          else
            for (const choice of view.choices) {
              expect(typeof choice.id).toBe('number');
              queue.push([...path, choice.id as number]);
            }
        }
        expect(paths).toBe(key.id === roles().middleIds[0] ? 81 : key.id === roles().finaleId ? 6 : 9);
        total += paths;
      }
    expect(total).toBe(111);
  });

  it('finishes eight real seven-scene runs through both middle orders, clock variants and endings', () => {
    for (const order of [roles().middleIds, [...roles().middleIds].reverse()])
      for (const loud of [false, true])
        for (const keep of [false, true]) {
          const r = runner();
          let scenes = 0;
          const play = (id: string, choices: number[]) => {
            expect(r.s.store.getState().offers.some(o => o.entry.id === id)).toBe(true);
            r.s.pickOffer(id);
            r.s.confirm();
            complete(r, choices);
            scenes++;
          };
          const roster = () =>
            play(
              r.s.store.getState().offers.find(o => o.kind === 'encounter' && o.entry.id.startsWith('stub_'))!.entry.id,
              [0],
            );
          expect(r.s.store.getState().offers.map(o => o.entry.id)).toEqual(['written_clause']);
          play('written_clause', [0]);
          play(roles().firstId, [loud ? 2 : 0]);
          r.s.endCycle();
          roster();
          play(order[0]!, order[0] === roles().middleIds[0] ? [loud ? 1 : 2, 1] : [loud ? 0 : 1]);
          r.s.endCycle();
          play(order[1]!, order[1] === roles().middleIds[0] ? [loud ? 1 : 2, 1] : [loud ? 0 : 1]);
          roster();
          r.s.endCycle();
          expect(r.s.store.getState().cycle.cycle).toBe(4);
          expect(r.s.store.getState().pursuitFull).toBe(loud);
          expect(r.s.store.getState().offers.map(o => o.entry.id)).toEqual([roles().finaleId]);
          r.s.pickOffer(roles().finaleId);
          r.s.confirm();
          expect(r.s.store.getState().choices).toHaveLength(2);
          r.s.act(r.s.store.getState().choices[keep ? 0 : 1]!.id);
          r.s.act('odds');
          expect(r.s.store.getState().odds!.target).toBe(loud ? 9 : 8);
          r.s.act('back');
          const resumed = runner(r.s.save());
          complete(resumed, [keep ? 0 : 1]);
          scenes++;
          expect(scenes).toBe(7);
          expect(resumed.s.store.getState().bg).toBe(keep ? 'end_closed' : 'end_open');
          expect(runner(resumed.s.save()).s.store.getState().ended).toBe(true);
        }
  });

  it('reports zero/partial-credit and capped-meter changes honestly', () => {
    for (const credits of [0, 200])
      for (const stance of [0, 1])
        for (const grade of ['cost', 'fail'] as const) {
          const r = entry(roles().finaleId, credits);
          complete(r, [stance], grade);
          expect(r.s.store.getState().res.Credits).toBe(0);
          const nominal = [
            [-500, -1000],
            [-1000, -500],
          ][stance]![grade === 'cost' ? 0 : 1]!;
          expect(r.s.store.getState().ledger.at(-1)!.t.split('. ').slice(0, 2)).toEqual([
            `[STUB] Scheduled: Credits ${nominal.toLocaleString('en-US')}`,
            `Applied: Credits ${-credits}`,
          ]);
        }
    for (const approach of [0, 2]) {
      const save = entry(roles().firstId).s.save();
      save.res.Strain = 0;
      save.res.Renown = 5;
      const r = runner(save);
      complete(r, [approach]);
      expect(r.s.store.getState().ledger.at(-1)!.t.split('. ').slice(0, 2)).toEqual(
        approach === 0
          ? ['[STUB] Scheduled: Strain -1', 'Applied: Strain 0']
          : ['[STUB] Scheduled: Renown +1, Pursuit +1', 'Applied: Renown 0; Pursuit 1'],
      );
    }
  });
});

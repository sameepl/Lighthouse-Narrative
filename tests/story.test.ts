import { describe, expect, it } from 'vitest';
import { data } from '../src/data';
import inkJson from '../src/story/main.ink';
import { GameSession } from '../src/bridge/session';
import type { SaveData } from '../src/bridge/types';
import type { Dice, Grade } from '../src/engine/types';
import { choiceId, makeSession, view } from './helpers';

const sums: Record<Grade, (target: number, mod: number) => number> = {
  clean: (t, m) => t + data.rules.cleanMargin - m,
  cost: (t, m) => t - m,
  fail: (t, m) => t - 1 - m,
};
const diceFor = (sum: number): Dice => {
  const s = Math.min(12, Math.max(2, sum));
  return [Math.floor(s / 2), Math.ceil(s / 2)];
};

describe('The Written Clause: scripted playthroughs', () => {
  it('opens on the scene with the four options and a hint on each approach', () => {
    const { session } = makeSession();
    const v = view(session);
    expect(v.bg).toBe('hall');
    expect(v.events.filter(e => e.type === 'para')).toHaveLength(6);
    expect(v.choices.map(c => c.text)).toEqual([
      'Press for parity',
      'Ask for protected-escort status',
      'Take the pages away and let Priya read them',
      'Decline for now',
    ]);
    expect(v.choices[0]).toMatchObject({ kind: 'choice', sub: 'Persuade / Diplomat' });
    expect(v.res).toEqual({ Credits: 52000, Edge: 3, Strain: 0, Renown: 0 });
  });

  it('stages a check, shows odds only on request, and rolls', () => {
    const { session, dice } = makeSession();
    session.act(choiceId(session, 'Press for parity'));
    expect(view(session).choices.map(c => c.kind)).toEqual(['try', 'odds', 'back']);
    expect(view(session).odds).toBeNull();
    session.act('odds');
    expect(view(session).odds).toMatchObject({ target: 8, mod: 3, success: 83, clean: 58 });
    dice.next = [5, 5];
    session.act('try');
    const v = view(session);
    expect(v.phase).toBe('hub');
    expect(v.events.find(e => e.type === 'roll')).toMatchObject({ total: 13, grade: 'clean' });
    expect(v.ledger.map(n => n.kind)).toEqual(['gain', 'gain']);
    expect(v.res.Strain).toBe(0);
  });

  it('Back undoes the pick, the echo and the staged text', () => {
    const { session } = makeSession();
    const before = view(session).events.length;
    session.act(choiceId(session, 'Press for parity'));
    expect(view(session).events.length).toBe(before + 1);
    session.act('back');
    expect(view(session).events.length).toBe(before);
    expect(view(session).choices).toHaveLength(4);
  });

  it('offers Edge after a failure, and spending it re-rolls', () => {
    const { session, dice } = makeSession();
    session.act(choiceId(session, 'Press for parity'));
    dice.next = [1, 2];
    session.act('try');
    expect(view(session).choices.map(c => c.kind)).toEqual(['edge', 'accept']);
    expect(view(session).choices[0]).toMatchObject({ text: '', command: { code: 'edge', reroll: true, left: 3 } });
    dice.next = [6, 5];
    session.act('edge');
    const v = view(session);
    expect(v.res.Edge).toBe(2);
    expect(v.phase).toBe('hub');
    expect(v.events.filter(e => e.type === 'roll')).toHaveLength(2);
    expect(v.ledger.some(n => n.t.includes('every hull'))).toBe(true);
  });

  it('accepting a failure costs Strain and moves the story on', () => {
    const { session, dice } = makeSession();
    session.act(choiceId(session, 'Ask for protected-escort status'));
    dice.next = [1, 1];
    session.act('try');
    session.act('accept');
    const v = view(session);
    expect(v.phase).toBe('hub');
    expect(v.res).toMatchObject({ Strain: 1, Edge: 3 });
    expect(v.ledger.map(n => n.kind)).toEqual(['cost', 'cost']);
  });

  it('a success with a cost on the escort clause costs Credits and Edge can upgrade it', () => {
    const { session, dice } = makeSession();
    session.act(choiceId(session, 'Ask for protected-escort status'));
    dice.next = [2, 3]; // 5 + 3 = 8: cost
    session.act('try');
    expect(view(session).choices[0]).toMatchObject({ text: '', command: { code: 'edge', reroll: false, left: 3 } });
    session.act('accept');
    expect(view(session).res.Credits).toBe(49000);
  });

  it("Priya's reading adds +1 to later checks and removes the no-roll option", () => {
    const { session } = makeSession();
    session.act(choiceId(session, 'Take the pages away and let Priya read them'));
    session.act(choiceId(session, 'Return to the hall'));
    const v = view(session);
    expect(v.choices.map(c => c.text)).toEqual([
      'Press for parity',
      'Ask for protected-escort status',
      'Decline for now',
    ]);
    session.act(choiceId(session, 'Press for parity'));
    session.act('odds');
    expect(view(session).odds).toMatchObject({
      mod: 4,
      parts: [
        { label: 'Diplomat', n: 2 },
        { label: 'SOC', n: 1 },
        { label: 'Priya’s reading', n: 1 },
      ],
    });
  });

  it('declining writes nothing down', () => {
    const { session } = makeSession();
    session.act(choiceId(session, 'Decline for now'));
    session.act(choiceId(session, 'Continue'));
    const v = view(session);
    expect(v.phase).toBe('hub');
    expect(v.events.find(e => e.type === 'summary')).toMatchObject({ items: [{ kind: 'watch' }] });
  });
});

describe('saving and loading', () => {
  it('round-trips through JSON mid-scene', () => {
    const { session } = makeSession();
    session.act(choiceId(session, 'Take the pages away and let Priya read them'));
    const saved = JSON.parse(JSON.stringify(session.save())) as SaveData;
    const { session: loaded } = makeSession(saved);
    expect(view(loaded).choices.map(c => c.text)).toEqual(['Return to the hall']);
    expect(view(loaded).events.length).toBe(view(session).events.length);
  });
  it('saving mid-roll restores to the choice menu, before the pick', () => {
    const { session } = makeSession();
    session.act(choiceId(session, 'Press for parity'));
    const { session: loaded } = makeSession(JSON.parse(JSON.stringify(session.save())) as SaveData);
    expect(view(loaded).choices.map(c => c.kind)).toEqual(['choice', 'choice', 'choice', 'choice']);
  });
  it('restart resets everything', () => {
    const { session, dice } = makeSession();
    session.act(choiceId(session, 'Press for parity'));
    dice.next = [1, 1];
    session.act('try');
    session.act('accept');
    expect(view(session).res.Strain).toBe(1);
    session.restart();
    expect(view(session).res).toEqual({ Credits: 52000, Edge: 3, Strain: 0, Renown: 0 });
    expect(view(session).ended).toBe(false);
  });
});

// ---- exhaustive walk ---------------------------------------------------------------------
// Visit every reachable branch: every choice, every roll grade, both Edge and no-Edge paths.
describe('every branch of the story', () => {
  const endings = new Map<string, string[]>();
  let paths = 0;

  const fresh = (saved: SaveData, dice: { next: Dice }) =>
    new GameSession({ inkJson, data, rng: () => dice.next, saved });

  function explore(session: GameSession, trail: string[], depth: number): void {
    expect(depth).toBeLessThan(12); // the scene must terminate
    const v = view(session);
    if (v.phase === 'hub') {
      paths++;
      expect(v.events.some(e => e.type === 'summary')).toBe(true);
      endings.set(
        v.ledger.map(n => `${n.kind}:${n.t}`).join('\n') + `\nStrain=${v.res.Strain} Credits=${v.res.Credits}`,
        trail,
      );
      return;
    }
    const save = session.save();
    for (const choice of v.choices) {
      const dice = { next: [4, 4] as Dice };
      const probe = fresh(save, dice);
      probe.act(choice.id);
      if (view(probe).choices[0]?.kind !== 'try') {
        explore(probe, [...trail, choice.text], depth + 1);
        continue;
      }
      probe.act('odds');
      const { target, mod } = view(probe).odds!;
      for (const grade of ['clean', 'cost', 'fail'] as Grade[]) {
        for (const mode of ['accept', 'edge'] as const) {
          const d = { next: diceFor(sums[grade](target, mod)) };
          const s = fresh(save, d);
          s.act(choice.id);
          s.act('try');
          if (view(s).choices[0]?.kind === 'edge') {
            if (mode === 'edge') {
              d.next = diceFor(sums.clean(target, mod));
              s.act('edge');
            } else s.act('accept');
          } else if (mode === 'edge') continue; // clean on the first roll: no Edge decision exists
          explore(s, [...trail, `${choice.text} [${grade}/${mode}]`], depth + 1);
        }
      }
    }
  }

  it('completes with no ink errors and reaches every outcome', () => {
    explore(fresh(makeSession().session.save(), { next: [4, 4] }), [], 0);
    expect(paths).toBeGreaterThan(10);
    const text = [...endings.keys()].join('\n');
    for (const needle of [
      'for every hull',
      'wary of your fleet',
      'No arms clause',
      'escorts of record',
      'heavy end',
      'berth priority slips',
      'Nothing is written down',
      'Priya’s reading gives you +1',
    ])
      expect(text, `outcome containing "${needle}" is reachable`).toContain(needle);
    // 3 grades x 2 approaches, the unsigned ending, and the Priya variants of each
    expect(endings.size).toBeGreaterThanOrEqual(7);
  });
});

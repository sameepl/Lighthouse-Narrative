import { Compiler } from 'inkjs/full';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/bridge/session';
import { data as productionData } from '../src/data';
import inkJson from '../src/story/main.ink';
// These lifecycle tests require an unrestricted board in both modes. Keep the real
// recovery catalog, but do not let a production tutorial/keystone schedule gate it.
const data = { ...productionData, keystones: [], season: { status: 'unconfigured' } as const };

const fixture = (body: string) =>
  new Compiler(readFileSync('src/story/lib/world.ink', 'utf8') + '\n-> END\n' + body).Compile().ToJson()!;
const load = (session: GameSession, ink = inkJson) =>
  new GameSession({ data, inkJson: ink, saved: JSON.parse(JSON.stringify(session.save())) });
const warning = (slice: boolean, ink = inkJson) => {
  const saved = new GameSession({ data, inkJson: ink, seed: 57, slice }).save();
  saved.res.Credits = 0;
  saved.run.cycle.arrears = data.rules.cycle.upkeep.arrearsLimit - 2;
  // Both slice and full runs reach Pursuit-full on the failed settlement.
  saved.run.cycle.pursuit.value = saved.run.cycle.pursuit.length - 2;
  return new GameSession({ data, inkJson: ink, saved, slice });
};

describe('foreclosure terminal lifecycle', () => {
  it.each([true, false])('runs the public warning-to-ending path (slice=%s)', slice => {
    const session = warning(slice);
    session.act('endCycle');
    expect(session.store.getState().choices.find(c => c.id === 'endCycle')?.command).toMatchObject({
      upkeep: { warning: false, failed: true },
    });
    const before = session.save();
    expect(before.run.cycle.arrears).toBe(3);
    session.act('endCycle');
    const saved = session.save();
    expect(saved.run).toMatchObject({ phase: 'ended', ending: null, active: null, offers: [], boardStatus: 'ended' });
    expect(saved.run.cycle).toMatchObject({
      failed: true,
      arrears: 4,
      pursuit: { value: before.run.cycle.pursuit.length },
    });
    expect(saved.run.rngState).toBe(before.run.rngState);
    expect(saved.run.played).toEqual(before.run.played);
    expect(saved.run.completed).toEqual(before.run.completed);
    expect(saved.ledger).toHaveLength(before.ledger.length + 1);
    expect(
      saved.events
        .filter(e => e.type === 'para')
        .map(e => e.html)
        .join(' '),
    ).toContain('credit withdrawn');
    expect(saved.events.at(-1)).toMatchObject({ type: 'summary', items: saved.ledger });
    const restored = load(session);
    expect(restored.save()).toEqual(saved);
    for (const terminal of [session, restored]) {
      expect(() => terminal.endCycle()).toThrow();
      expect(() => terminal.pickOffer('upkeep_recovery')).toThrow();
      expect(() => terminal.confirm()).toThrow();
      expect(terminal.save()).toEqual(saved);
      expect(terminal.store.getState().choices).toMatchObject([{ id: 'restart', command: { code: 'restart' } }]);
    }
    restored.act('restart');
    expect(restored.store.getState().ended).toBe(false);
    expect(restored.save().run.cycle.arrears).toBe(0);
  });

  it.each([
    '=== elsewhere ===\n-> scene_end',
    '=== foreclosure ===\n~ add("Credits", 27)\n~ note("cost", "partial")\nPartial text. # bg:broken\n-> END',
  ])('rolls back the entire settlement when the ending cannot run', body => {
    const ink = fixture(body);
    const session = warning(false, ink);
    session.endCycle();
    const before = session.save();
    const view = structuredClone(session.store.getState());
    expect(() => session.endCycle()).toThrow();
    expect(session.save()).toEqual(before);
    expect(session.store.getState()).toEqual(view);
    expect(() => session.endCycle()).toThrow();
    expect(session.save()).toEqual(before);
  });

  it('normalizes shipped v4 terminal markers without replaying the ending', () => {
    const session = warning(false);
    session.endCycle();
    session.endCycle();
    const canonical = session.save();
    const legacy = structuredClone(canonical);
    legacy.run.ending = 'foreclosure';
    const restored = new GameSession({ data, inkJson, saved: legacy });
    expect(restored.save()).toEqual(canonical);
    expect(legacy.run.ending).toBe('foreclosure');
    expect(restored.store.getState().choices.map(c => c.id)).toEqual(['restart']);
  });

  it('resumes a paused ending without repeating settlement or consuming RNG', () => {
    const ink = fixture('=== foreclosure ===\nNotice.\n+ [Acknowledge]\n    -> scene_end');
    const session = warning(false, ink);
    session.endCycle();
    session.endCycle();
    const saved = session.save();
    expect(saved.run).toMatchObject({ phase: 'scene', ending: 'foreclosure', active: null, offers: [] });
    const restored = load(session, ink);
    expect(restored.save()).toEqual(saved);
    for (const terminal of [session, restored]) {
      expect(() => terminal.endCycle()).toThrow();
      expect(() => terminal.confirm()).toThrow();
      expect(() => terminal.pickOffer('upkeep_recovery')).toThrow();
      terminal.act(0);
      const ended = terminal.save();
      expect(ended.run).toMatchObject({ phase: 'ended', ending: null, active: null });
      expect(ended.res).toEqual(saved.res);
      expect(ended.ledger).toEqual(saved.ledger);
      expect(ended.run.rngState).toBe(saved.run.rngState);
      expect(load(terminal, ink).save()).toEqual(ended);
    }
    for (const patch of [{ active: saved.run.offers[0] ?? {} }, { ending: null }, { phase: 'hub' }]) {
      const invalid = structuredClone(saved);
      Object.assign(invalid.run, patch);
      expect(() => new GameSession({ data, inkJson: ink, saved: invalid })).toThrow();
    }
  });

  it('offers real repeatable ship-free recovery at zero Credits before foreclosure', () => {
    const initial = Array.from({ length: 100 }, (_, seed) => new GameSession({ data, inkJson, seed }))
      .find(s => s.store.getState().offers.some(o => o.entry.id === 'upkeep_recovery'))!
      .save();
    initial.res.Credits = 0;
    initial.run.cycle.arrears = 2;
    const session = new GameSession({ data, inkJson, saved: initial, rng: () => [6, 6] });
    const offer = session.store.getState().offers.find(o => o.entry.id === 'upkeep_recovery')!;
    expect(offer.entry).toMatchObject({ cost: 0, requires: {}, repeat: { kind: 'repeatable', cooldown: 0 } });
    session.pickOffer(offer.entry.id);
    session.assign({ shipId: null, crewIds: [] });
    session.confirm();
    expect(session.store.getState().res.Credits).toBe(0);
    expect(
      session.store
        .getState()
        .choices.map(c => c.text)
        .join(' '),
    ).toContain('Sort the packet');
    session.act(0);
    session.act('try');
    if (session.store.getState().choices.some(c => c.id === 'accept')) session.act('accept');
    expect(session.store.getState().phase).toBe('hub');
    expect(session.store.getState().res.Credits).toBe(2000);
    expect(session.save().run.played).toContainEqual({ id: 'upkeep_recovery', cycle: 1 });
  });
});

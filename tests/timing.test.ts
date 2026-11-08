import { afterEach, expect, it, vi } from 'vitest';
import { createTimingRecorder } from '../src/ui/timing';
import { GameSession } from '../src/bridge/session';
import inkJson from '../src/story/main.ink';
import { storyData } from './helpers';
import type { TimingEvent } from '../src/bridge/types';
import { continueGame } from '../src/ui/persist';
import { Compiler } from 'inkjs/full';
import { readFileSync } from 'node:fs';
afterEach(() => vi.unstubAllGlobals());

it('uses independent browser session storage for two timing-enabled tabs', async () => {
  const shared = { getItem: vi.fn(), setItem: vi.fn() };
  const logs = [];
  for (let tab = 0; tab < 2; tab++) {
    const values = new Map<string, string>();
    vi.stubGlobal('window', {
      location: { search: '?timing=1' },
      localStorage: shared,
      sessionStorage: {
        getItem: (k: string) => values.get(k) ?? null,
        setItem: (k: string, v: string) => values.set(k, v),
      },
    });
    vi.resetModules();
    logs.push((await import('../src/ui/timing')).timing!);
  }
  logs[0]!.record({ type: 'run-start', cycle: 1, sceneId: null });
  logs[1]!.record({ type: 'run-resume', cycle: 3, sceneId: 'written_clause' });
  expect(JSON.parse(logs[0]!.json()).map((e: TimingEvent) => e.type)).toEqual(['run-start']);
  expect(JSON.parse(logs[1]!.json()).map((e: TimingEvent) => e.type)).toEqual(['run-resume']);
  expect(shared.setItem).not.toHaveBeenCalled();
});

it('is off by default and persists only bounded diagnostic fields when explicitly enabled', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: vi.fn((k: string) => values.get(k) ?? null),
    setItem: (k: string, v: string) => values.set(k, v),
  };
  expect(createTimingRecorder('', storage)).toBeNull();
  expect(createTimingRecorder('?timing=0', storage)).toBeNull();
  expect(storage.getItem).not.toHaveBeenCalled();
  const recorder = createTimingRecorder('?timing=1', storage, () => 123)!;
  recorder.record({ type: 'choice', cycle: 1, sceneId: 'written_clause' });
  expect(JSON.parse(recorder.json())).toEqual([{ type: 'choice', cycle: 1, sceneId: 'written_clause', at: 123 }]);
  expect(createTimingRecorder('?timing=1', storage)!.json()).toBe(recorder.json());
  const bounded = createTimingRecorder('?timing=1')!;
  for (let n = 0; n < 5001; n++) bounded.record({ type: 'roll', cycle: 1, sceneId: 'written_clause' });
  expect(JSON.parse(bounded.json())).toHaveLength(5000);
  const blocked = createTimingRecorder('?timing=1', {
    getItem: () => {
      throw Error('denied');
    },
    setItem: () => {
      throw Error('denied');
    },
  })!;
  blocked.record({ type: 'hub-shown', cycle: 2, sceneId: null });
  expect(JSON.parse(blocked.json())).toHaveLength(1);
});

it('logs successful gameplay and reloads without changing saves, including terminal lifecycle', () => {
  const events: TimingEvent[] = [];
  const options = { data: storyData, inkJson, rng: () => [6, 6] as [number, number] };
  const s = new GameSession({ ...options, onTiming: e => events.push(e) });
  const control = new GameSession({ ...options, saved: s.save() });
  expect(continueGame(control)).toBe(control);
  expect(events.map(e => e.type)).toEqual(['run-start', 'hub-shown']);
  for (const session of [s, control]) {
    session.pickOffer('written_clause');
    session.confirm();
    session.act(session.store.getState().choices[0]!.id);
    session.act('try');
    session.endCycle();
  }
  expect(s.save()).toEqual(control.save());
  expect(JSON.stringify(s.save())).not.toContain('run-start');
  expect(events.map(e => e.type)).toEqual([
    'run-start',
    'hub-shown',
    'offer-picked',
    'scene-started',
    'choice',
    'choice',
    'roll',
    'scene-ended',
    'hub-shown',
    'cycle-end',
    'hub-shown',
  ]);
  expect(events.find(e => e.type === 'roll')).toMatchObject({ sceneId: 'written_clause', cycle: 1 });
  const before = events.length;
  expect(() => s.act('not-valid')).toThrow();
  expect(events).toHaveLength(before);
  new GameSession({ ...options, saved: s.save(), onTiming: e => events.push(e) });
  expect(events.at(-2)?.type).toBe('run-resume');
  const terminalOptions = {
    ...options,
    inkJson: new Compiler(`${readFileSync('src/story/lib/world.ink', 'utf8')}
-> END
=== foreclosure ===
A terminal fixture.
+ [Finish]
    -> scene_end
`)
      .Compile()
      .ToJson()!,
  };
  const saved = new GameSession(terminalOptions).save();
  saved.res.Credits = 0;
  const terminal = new GameSession({ ...terminalOptions, saved, onTiming: e => events.push(e) });
  for (let n = 0; n < storyData.rules.cycle.upkeep.arrearsLimit; n++) terminal.endCycle();
  expect(events.some(e => e.type === 'scene-started' && e.sceneId === 'foreclosure')).toBe(true);
  new GameSession({ ...terminalOptions, saved: terminal.save(), onTiming: e => events.push(e) });
  expect(events.at(-1)).toMatchObject({ type: 'run-resume', sceneId: 'foreclosure' });
  while (!terminal.store.getState().ended) terminal.act(terminal.store.getState().choices[0]!.id);
  expect(events.at(-1)).toMatchObject({ type: 'run-end', sceneId: 'foreclosure' });
  const completions = events.filter(e => e.type === 'run-end').length;
  for (let n = 0; n < 2; n++)
    new GameSession({ ...terminalOptions, saved: terminal.save(), onTiming: e => events.push(e) });
  expect(events.filter(e => e.type === 'run-end')).toHaveLength(completions);
  expect(
    () =>
      new GameSession({
        ...options,
        onTiming: () => {
          throw Error('observer');
        },
      }),
  ).not.toThrow();
});

it.each([false, true])('counts actual dice rolls, not an Edge upgrade (failure=%s)', fail => {
  const events: TimingEvent[] = [];
  const s = new GameSession({
    data: storyData,
    inkJson,
    rng: () => (fail ? [1, 1] : [3, 3]),
    onTiming: e => events.push(e),
  });
  s.pickOffer('written_clause');
  s.confirm();
  s.act(s.store.getState().choices[0]!.id);
  s.act('try');
  s.act('edge');
  expect(events.filter(e => e.type === 'roll')).toHaveLength(fail ? 2 : 1);
});

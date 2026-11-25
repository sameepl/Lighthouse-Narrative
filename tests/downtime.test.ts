import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { GameSession } from '../src/bridge/session';
import inkJson from '../src/story/main.ink';
import { storyData } from './helpers';
import { cycleReport, acknowledgeCycle, acknowledgedCycle, clearDowntime } from '../src/ui/downtime';
import { Downtime } from '../src/ui/components/Downtime';
import { downtimeBalances, downtimeNext, downtimeTitle } from '../src/ui/strings';
import { clearSave, writeSave } from '../src/ui/persist';
const session = () => new GameSession({ data: storyData, inkJson });
afterEach(() => vi.unstubAllGlobals());

it('maps real settlements to cycle-only notes and current balances, excluding mid-scene and terminal states', () => {
  const s = session();
  expect(cycleReport(s.store.getState())).toBeNull();
  s.endCycle();
  const report = cycleReport(s.store.getState())!;
  expect(report).toMatchObject({ cycle: 1, nextCycle: 2, upkeep: { upkeepPaid: 4000, upkeepShortfall: 0 } });
  expect(downtimeBalances(report.resources, report.pursuit)).toBe('Credits Cr48000; Renown 0; Strain 0; Pursuit 1/6.');
  expect(downtimeTitle(report.cycle)).toBe('Cycle 1 settled');
  expect(downtimeNext(report.nextCycle)).toBe('Start cycle 2');
  s.endCycle();
  expect(cycleReport(s.store.getState())!.ledger.filter(n => n.command?.code === 'upkeepSettlement')).toHaveLength(1);
  const view = s.store.getState();
  const later = { t: 'Later reward', kind: 'gain' as const };
  const withReward = { ...view, ledger: [...view.ledger, later] };
  expect(cycleReport(withReward)!.ledger).not.toContainEqual(later);
  const settlement = view.ledger.at(-1)!;
  const next = { ...withReward, cycle: { ...view.cycle, cycle: 4 }, ledger: [...withReward.ledger, settlement] };
  expect(cycleReport(next)!.ledger.filter(n => n.t === later.t)).toHaveLength(1);
  expect(cycleReport({ ...view, phase: 'scene' })).toBeNull();
  expect(cycleReport({ ...view, ended: true, phase: 'ended' })).toBeNull();
  expect(cycleReport({ ...view, cycle: { ...view.cycle, actionsLeft: 1 } })).toBeNull();
  expect(cycleReport(new GameSession({ data: storyData, inkJson, saved: s.save() }).store.getState())).toEqual(
    cycleReport(view),
  );
});

it('keeps acknowledgement separate from game state and clears it for a new run', async () => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
    removeItem: (k: string) => values.delete(k),
  });
  clearDowntime(6);
  const s = session();
  s.endCycle();
  writeSave(s);
  const before = JSON.stringify(s.save());
  expect(acknowledgedCycle(6)).toBe(0);
  acknowledgeCycle(6, 5);
  expect(acknowledgedCycle(6, 2)).toBe(0);
  expect(acknowledgedCycle(6, 5)).toBe(5);
  acknowledgeCycle(6, 2);
  vi.resetModules();
  expect((await import('../src/ui/downtime')).acknowledgedCycle(6)).toBe(2);
  expect(JSON.stringify(s.save())).toBe(before);
  clearSave();
  expect(acknowledgedCycle(6)).toBe(0);
});

it('renders an accessible settlement and arrears warning without story or choice controls', () => {
  const save = session().save();
  save.res.Credits = 200;
  const s = new GameSession({ data: storyData, inkJson, saved: save });
  s.endCycle();
  const report = cycleReport(s.store.getState())!;
  const html = renderToStaticMarkup(
    createElement(Downtime, { report, onStart: () => {}, error: false, onRetry: () => {}, focus: false }),
  );
  expect(html).toContain('aria-labelledby="downtime-title"');
  expect(html).toContain('paid Cr200; shortfall Cr3800');
  expect(html).toContain('Unpaid upkeep remains');
  expect(html).toContain('Start cycle 2');
});

import type { GameView } from '../bridge/types';
import { data } from '../data';

export function cycleReport(view: GameView) {
  if (view.phase !== 'hub' || view.ended || view.cycle.cycle < 2 || view.cycle.actionsLeft !== data.rules.cycle.actions)
    return null;
  const index = view.ledger.map(n => n.command?.code).lastIndexOf('upkeepSettlement');
  const command = view.ledger[index]?.command;
  if (command?.code !== 'upkeepSettlement') return null;
  const previous = view.ledger
    .slice(0, index)
    .map(n => n.command?.code)
    .lastIndexOf('upkeepSettlement');
  return {
    cycle: view.cycle.cycle - 1,
    nextCycle: view.cycle.cycle,
    upkeep: command.settlement,
    ledger: view.ledger.slice(previous + 1, index + 1),
    resources: view.res,
    pursuit: view.cycle.pursuit,
  };
}
export type CycleReport = NonNullable<ReturnType<typeof cycleReport>>;
const memory = new Map<number, number>();
const key = (length: number) => `lighthouse-narrative-downtime-${length}`;
export function acknowledgedCycle(length: number, loadedCycle = Number.MAX_SAFE_INTEGER): number {
  try {
    const value = Number(localStorage.getItem(key(length)));
    if (Number.isSafeInteger(value) && value >= 0)
      return Math.max(value, memory.get(length) ?? 0) > loadedCycle ? 0 : Math.max(value, memory.get(length) ?? 0);
  } catch {
    /* in-memory fallback */
  }
  return (memory.get(length) ?? 0) > loadedCycle ? 0 : (memory.get(length) ?? 0);
}
export function acknowledgeCycle(length: number, cycle: number): void {
  memory.set(length, cycle);
  try {
    localStorage.setItem(key(length), String(cycle));
  } catch {
    /* keep playing */
  }
}
export function clearDowntime(length: number): void {
  memory.delete(length);
  try {
    localStorage.removeItem(key(length));
  } catch {
    /* keep playing */
  }
}

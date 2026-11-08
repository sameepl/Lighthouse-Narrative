import type { TimingEvent } from '../bridge/types';

type Entry = TimingEvent & { at: number };
const KEY = 'lighthouse-narrative-timing-v1';
const TYPES = [
  'run-start',
  'run-resume',
  'hub-shown',
  'offer-picked',
  'scene-started',
  'choice',
  'roll',
  'scene-ended',
  'cycle-end',
  'run-end',
];
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

/** Explicit opt-in on each page load; bounded diagnostics never enter a game save. */
export function createTimingRecorder(search: string, storage?: StoragePort, now = Date.now) {
  if (new URLSearchParams(search).get('timing') !== '1') return null;
  let entries: Entry[] = [];
  try {
    const raw: unknown = JSON.parse(storage?.getItem(KEY) ?? '[]');
    if (Array.isArray(raw))
      entries = raw
        .filter(
          e =>
            e &&
            TYPES.includes(e.type) &&
            Number.isFinite(e.at) &&
            Number.isInteger(e.cycle) &&
            e.cycle > 0 &&
            (e.sceneId === null || (typeof e.sceneId === 'string' && /^[a-z][a-z0-9_]*$/.test(e.sceneId))),
        )
        .slice(-5000)
        .map(({ type, sceneId, cycle, at }) => ({ type, sceneId, cycle, at }));
  } catch {
    /* invalid or unavailable diagnostics are disposable */
  }
  return {
    record(event: TimingEvent) {
      entries.push({ type: event.type, sceneId: event.sceneId, cycle: event.cycle, at: now() });
      entries = entries.slice(-5000);
      try {
        storage?.setItem(KEY, JSON.stringify(entries));
      } catch {
        /* keep the in-memory log */
      }
    },
    json: () => JSON.stringify(entries, null, 2),
  };
}

function browserRecorder() {
  if (typeof window === 'undefined' || new URLSearchParams(window.location.search).get('timing') !== '1') return null;
  try {
    return createTimingRecorder(window.location.search, window.sessionStorage);
  } catch {
    return createTimingRecorder(window.location.search);
  }
}
export const timing = browserRecorder();

export function exportTiming(): void {
  if (!timing) return;
  const url = URL.createObjectURL(new Blob([timing.json()], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lighthouse-timing.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

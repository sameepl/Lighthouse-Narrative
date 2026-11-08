import { GameSession } from '../bridge/session';
import type { LegacySaveData, SaveData } from '../bridge/types';
import { data } from '../data';
import inkJson from '../story/main.ink';

const SLICE = data.season.status === 'configured' && !data.season.full;
const PREFIX = 'lighthouse-narrative-save';
const SLICE_PREFIX = 'lighthouse-narrative-slice-save';
const KEY = `${SLICE ? SLICE_PREFIX : PREFIX}-v4`;
const V3_KEY = `${SLICE ? SLICE_PREFIX : PREFIX}-v3`;
const LEGACY_KEYS = ['lighthouse-narrative-save-v1', 'lighthouse-narrative-save-v2'];
let activeSlice: boolean | undefined;

/** Full saves take precedence when available; a slice survives later full activation. */
function restoreBrowserSave(discardInvalid: boolean): GameSession | null {
  for (const slice of SLICE ? [true] : data.season.status === 'configured' ? [false, true] : [false]) {
    const prefix = slice ? SLICE_PREFIX : PREFIX;
    for (const version of [4, 3] as const) {
      const key = slice === SLICE ? (version === 4 ? KEY : V3_KEY) : `${prefix}-v${version}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) continue;
        const saved = JSON.parse(raw) as SaveData | LegacySaveData;
        if (saved?.v !== version) throw new Error('Invalid save version');
        const session = new GameSession({ inkJson, data, saved, slice });
        activeSlice = slice;
        if (discardInvalid && version === 3) writeSave(session);
        return session;
      } catch (err) {
        if (!discardInvalid) continue;
        console.warn('Discarding unreadable save', err);
        try {
          localStorage.removeItem(key);
        } catch {
          /* storage unavailable */
        }
      }
    }
  }
  return null;
}

/** Prefer valid v4, falling back to validated v3 and then the other available mode. */
export function startGame(): GameSession {
  if (!SLICE)
    for (const key of LEGACY_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* storage unavailable */
      }
    }
  const saved = restoreBrowserSave(true);
  if (saved) return saved;
  activeSlice = SLICE;
  return new GameSession({ inkJson, data });
}

export function writeSave(session: GameSession): void {
  try {
    const saved = session.save();
    activeSlice = saved.run.cycle.pursuit.length === data.rules.cycle.pursuit.sliceLength;
    const prefix = activeSlice ? SLICE_PREFIX : PREFIX;
    localStorage.setItem(`${prefix}-v4`, JSON.stringify(saved));
    localStorage.removeItem(`${prefix}-v3`);
  } catch {
    /* private mode, quota: play on */
  }
}

export function clearSave(): void {
  if (activeSlice === undefined) restoreBrowserSave(false);
  const slice = activeSlice ?? SLICE;
  const prefix = slice ? SLICE_PREFIX : PREFIX;
  try {
    localStorage.removeItem(`${prefix}-v4`);
    localStorage.removeItem(`${prefix}-v3`);
    if (!slice) for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Read-only title probe: validation must neither migrate nor discard browser saves. */
export function readSavedGame(): GameSession | null {
  const sliceOnly = data.season.status === 'configured' && !data.season.full;
  for (const slice of sliceOnly ? [true] : data.season.status === 'configured' ? [false, true] : [false]) {
    const prefix = slice ? 'lighthouse-narrative-slice-save' : 'lighthouse-narrative-save';
    for (const version of [4, 3] as const) {
      const key = `${prefix}-v${version}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) continue;
        const saved = JSON.parse(raw) as SaveData | LegacySaveData;
        if (saved?.v === version) return new GameSession({ inkJson, data, saved, slice });
      } catch {
        /* try the fallback without changing storage */
      }
    }
  }
  return null;
}

export function newGame(): GameSession {
  clearSave();
  return new GameSession({ inkJson, data });
}

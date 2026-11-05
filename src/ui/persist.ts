import { GameSession } from '../bridge/session';
import type { LegacySaveData, SaveData } from '../bridge/types';
import { data } from '../data';
import inkJson from '../story/main.ink';

const KEY = 'lighthouse-narrative-save-v4';
const V3_KEY = 'lighthouse-narrative-save-v3';
const LEGACY_KEYS = ['lighthouse-narrative-save-v1', 'lighthouse-narrative-save-v2'];

/** Prefer valid v4, falling back to a fully validated v3 without losing it on write failure. */
export function startGame(): GameSession {
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  }
  for (const [key, version] of [
    [KEY, 4],
    [V3_KEY, 3],
  ] as const) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      const saved = JSON.parse(raw) as SaveData | LegacySaveData;
      if (saved?.v !== version) throw new Error('Invalid save version');
      const session = new GameSession({ inkJson, data, saved });
      if (version === 3) writeSave(session);
      return session;
    } catch (err) {
      console.warn('Discarding unreadable save', err);
      try {
        localStorage.removeItem(key);
      } catch {
        /* storage unavailable */
      }
    }
  }
  return new GameSession({ inkJson, data });
}

export function writeSave(session: GameSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session.save()));
    localStorage.removeItem(V3_KEY);
  } catch {
    /* private mode, quota: play on */
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(V3_KEY);
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Read-only title probe: validation must neither migrate nor discard browser saves. */
export function readSavedGame(): GameSession | null {
  for (const [key, version] of [
    [KEY, 4],
    [V3_KEY, 3],
  ] as const) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      const saved = JSON.parse(raw) as SaveData | LegacySaveData;
      if (saved?.v === version) return new GameSession({ inkJson, data, saved });
    } catch {
      /* try the fallback without changing storage */
    }
  }
  return null;
}

export function newGame(): GameSession {
  clearSave();
  return new GameSession({ inkJson, data });
}

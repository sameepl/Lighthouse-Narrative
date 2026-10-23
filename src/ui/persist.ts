import { GameSession } from '../bridge/session';
import type { SaveData } from '../bridge/types';
import { data } from '../data';
import inkJson from '../story/main.ink';

const KEY = 'lighthouse-narrative-save-v3';
const LEGACY_KEYS = ['lighthouse-narrative-save-v1', 'lighthouse-narrative-save-v2'];

function readSave(): SaveData | null {
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as SaveData | null;
    return raw?.v === 3 ? raw : null;
  } catch {
    return null;
  }
}

/** Starts the game, resuming a save when there is one. A save the story can no longer load is discarded. */
export function startGame(): GameSession {
  const saved = readSave();
  if (saved) {
    try {
      return new GameSession({ inkJson, data, saved });
    } catch (err) {
      console.warn('Discarding unreadable save', err);
      clearSave();
    }
  }
  return new GameSession({ inkJson, data });
}

export function writeSave(session: GameSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session.save()));
  } catch {
    /* private mode, quota: play on */
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

import { data } from '../src/data';
import inkJson from '../src/story/main.ink';
import { GameSession } from '../src/bridge/session';
import type { Dice } from '../src/engine/types';
import type { SaveData } from '../src/bridge/types';

/** A session whose dice are whatever `dice.next` says. */
export function makeSession(saved: SaveData | null = null, dice: { next: Dice } = { next: [4, 4] }) {
  const session = new GameSession({ inkJson, data, rng: () => dice.next, saved });
  return { session, dice };
}

export const view = (s: GameSession) => s.store.getState();
export const choiceId = (s: GameSession, text: string) => {
  const c = view(s).choices.find(x => x.text === text);
  if (!c) throw new Error(`No choice "${text}". Have: ${view(s).choices.map(x => x.text).join(' | ')}`);
  return c.id;
};

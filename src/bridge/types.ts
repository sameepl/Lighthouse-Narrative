import type { Dice, Grade, Note, NoteKind, OddsInfo } from '../engine/types';

export type GameEvent = { id: number } & (
  | { type: 'para'; html: string; speech: boolean }
  | { type: 'pick'; html: string }
  | { type: 'roll'; dice: Dice; mod: number; total: number; grade: Grade; label: string; edge?: string }
  | { type: 'note'; kind: NoteKind; t: string }
  | { type: 'summary'; items: Note[] }
);

export type ChoiceKind = 'choice' | 'try' | 'odds' | 'back' | 'edge' | 'accept';
export interface UIChoice { id: number | string; kind: ChoiceKind; text: string; sub?: string }

/** Everything the UI renders. Replaced (not mutated) on every change. */
export interface GameView {
  events: GameEvent[];
  choices: UIChoice[];
  odds: OddsInfo | null;
  bg: string;
  ended: boolean;
  res: Record<string, number>;
  ledger: Note[];
}

export interface SaveData {
  v: 1;
  ink: string;
  res: Record<string, number>;
  ledger: Note[];
  events: GameEvent[];
}

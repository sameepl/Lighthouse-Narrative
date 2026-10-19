export type Grade = 'clean' | 'cost' | 'fail';
export type NoteKind = 'gain' | 'cost' | 'watch';
export type Dice = [number, number];
export type Rng = () => Dice;

export interface Note {
  kind: NoteKind;
  t: string;
}

/** Everything the rules own. Narrative flags live in ink; numbers live here. */
export interface GameState {
  res: Record<string, number>;
  ledger: Note[];
}

/** A roll requested by the story (see src/story/lib/roll.ink). */
export interface CheckRequest {
  skills: string[]; // best of these is used
  target: number;
  bonuses: string[]; // names of ink flags; each active one adds its bonus from rules.json
}

export interface RollPart {
  label: string;
  n: number;
}
export interface RollSetup {
  parts: RollPart[];
  mod: number;
  target: number;
}

export interface OddsInfo {
  target: number;
  mod: number;
  parts: string[];
  success: number;
  clean: number;
}

export interface RollResult {
  dice: Dice;
  mod: number;
  total: number;
  grade: Grade;
  label: string;
  edge?: string; // set when Edge changed this result
}

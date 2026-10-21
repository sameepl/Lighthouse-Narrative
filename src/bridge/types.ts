import type { Encounter, Keystone } from '../data/schema';
import type { CycleState, Dice, Grade, Note, NoteKind, OddsInfo } from '../engine/types';

export type GameEvent = { id: number } & (
  | { type: 'para'; html: string; speech: boolean }
  | { type: 'pick'; html: string }
  | { type: 'roll'; dice: Dice; mod: number; total: number; grade: Grade; label: string; edge?: string }
  | { type: 'note'; kind: NoteKind; t: string }
  | { type: 'summary'; items: Note[] }
);
export type ChoiceKind = 'choice' | 'try' | 'odds' | 'back' | 'edge' | 'accept';
export interface UIChoice {
  id: number | string;
  kind: ChoiceKind;
  text: string;
  sub?: string;
}
export interface Assignments {
  shipId: string | null;
  crewIds: string[];
}
export type Offer =
  | { kind: 'encounter'; entry: Encounter; forced: false; weak: false }
  | { kind: 'keystone'; entry: Keystone; forced: boolean; weak: boolean };
export type RunPhase = 'hub' | 'prepare' | 'scene' | 'ended';
export type BoardStatus = 'ready' | 'no-eligible-offers' | 'actions-spent' | 'pursuit-full' | 'ended';
/** Plain engine-owned run state; saving offers prevents a reload from redrawing the board. */
export interface RunState {
  phase: RunPhase;
  cycle: CycleState;
  rngState: number;
  played: { id: string; cycle: number }[];
  completed: string[];
  leads: string[];
  assignments: Assignments;
  busyCrewIds: string[];
  active: Offer | null;
  offers: Offer[];
  /** The fixed encounter draw for this cycle; null until its first draw. */
  encounterBoard: Encounter[] | null;
  boardStatus: BoardStatus;
  unmetGuarantees: string[];
  blockedDue: string[];
  commercialReplacement: boolean;
}
/** Everything the UI renders. Values are detached snapshots, never mutable session state. */
export interface GameView {
  events: GameEvent[];
  choices: UIChoice[];
  odds: OddsInfo | null;
  bg: string;
  ended: boolean;
  res: Record<string, number>;
  ledger: Note[];
  /** Scheduling phase, separate from the scene's internal roll interaction. */
  phase: RunPhase;
  offers: Offer[];
  /** Pursuit is only here, never in res. */
  cycle: CycleState;
  assignments: Assignments;
  busyCrewIds: string[];
  boardStatus: BoardStatus;
  schedulerStatus: 'configured' | 'unconfigured';
  unmetGuarantees: string[];
  blockedDue: string[];
  commercialReplacement: boolean;
}
export interface SaveData {
  v: 2;
  ink: string;
  res: Record<string, number>;
  ledger: Note[];
  events: GameEvent[];
  bg: string;
  run: RunState;
}

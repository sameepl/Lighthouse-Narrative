import type { Encounter, Keystone } from '../data/schema';
import type { CycleState, Dice, Grade, Note, OddsInfo, RollPart, RollSetup } from '../engine/types';

/** Optional metadata keeps plain notes from ink and existing v2 saves compatible. */
export type LedgerNote = Note & { command?: { code: 'cycleUpkeep'; amount: number } };
export type AssistedRollPart = RollPart & { assist?: { crewId: string; name: string } };
export type AssistedRollSetup = Omit<RollSetup, 'parts'> & { parts: AssistedRollPart[] };
export type ViewOdds = Omit<OddsInfo, 'parts'> & { parts: AssistedRollPart[] };

export type GameEvent = { id: number } & (
  | { type: 'para'; html: string; speech: boolean }
  | { type: 'pick'; html: string }
  | { type: 'roll'; dice: Dice; mod: number; total: number; grade: Grade; label: string; edge?: string }
  | ({ type: 'note' } & LedgerNote)
  | { type: 'summary'; items: LedgerNote[] }
);
export type ChoiceKind = 'choice' | 'try' | 'odds' | 'back' | 'edge' | 'accept';
/** A dock command. The UI strings module turns codes and parameters into words. */
export type Command =
  | {
      code: 'offer';
      offerId: string;
      offerKind: 'encounter' | 'keystone';
      /** Display title from encounter or keystone data. */
      title: string;
      cost?: number;
      risk?: string;
      locked: boolean;
      forced: boolean;
      shipTag?: string;
      crew: string[];
    }
  | { code: 'endCycle'; actionsLeft: number; noEligibleOffers: boolean }
  | { code: 'restart' }
  | { code: 'ship'; shipId: string; name: string; tags: string[]; selected: boolean }
  | { code: 'crew'; crewId: string; name: string; skill: string; assigned: boolean }
  | { code: 'confirm' }
  | { code: 'cancel'; ready: boolean }
  | { code: 'try' | 'odds' | 'back' | 'accept' }
  | { code: 'edge'; reroll: boolean; left: number };
export interface UIChoice {
  id: number | string;
  kind: ChoiceKind;
  /** Story text from ink. Empty for bridge commands, which carry `command`. */
  text: string;
  sub?: string;
  command?: Command;
}
/** Hub status as data: the UI writes the sentence. */
export interface HubStatus {
  cycle: number;
  actionsLeft: number;
  board: BoardStatus;
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
  odds: ViewOdds | null;
  bg: string;
  ended: boolean;
  res: Record<string, number>;
  ledger: LedgerNote[];
  /** Scheduling phase, separate from the scene's internal roll interaction. */
  phase: RunPhase;
  offers: Offer[];
  /** Pursuit is only here, never in res. */
  cycle: CycleState;
  assignments: Assignments;
  busyCrewIds: string[];
  boardStatus: BoardStatus;
  /** Set only in the hub phase. */
  hub: HubStatus | null;
  schedulerStatus: 'configured' | 'unconfigured';
  unmetGuarantees: string[];
  blockedDue: string[];
  commercialReplacement: boolean;
}
export interface SaveData {
  v: 2;
  ink: string;
  res: Record<string, number>;
  ledger: LedgerNote[];
  events: GameEvent[];
  bg: string;
  run: RunState;
}

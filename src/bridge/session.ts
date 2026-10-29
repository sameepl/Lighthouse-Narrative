// Glue between the ink story (writing), the rules engine (numbers) and the UI.
//
// Ownership: ink owns narrative flags and what happens next; the engine owns resources and dice.
// The story calls res/add/note/trust (see story/lib/world.ink) and pauses at roll() (story/lib/roll.ink),
// where this session runs the interactive roll and then tells the story which outcome happened.
import { changeTrust } from '../engine/cycle';
import { assistedSetup } from './roll';
import { createSeededRng } from '../engine/rng';
import { RunController, type RunOptions } from './run';
import { validateSave } from './save';
import { runChoices } from './run-choices';
import { preparationProjection } from './view';
import type { Assignments } from './types';
import { Story } from 'inkjs';
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { GameData } from '../data/validate';
import { addResource, makeRoll, newGameState, oddsOf, spendEdge } from '../engine/rules';
import type { CheckRequest, GameState, Grade, NoteKind, Rng, RollResult } from '../engine/types';
import type { AssistedRollSetup, GameEvent, GameView, LedgerNote, SaveData, UIChoice } from './types';

const CHECK_CHOICE = '__check__';
const GRADE_VALUE: Record<Grade, number> = { clean: 2, cost: 1, fail: 0 };
const NOTE_KINDS: NoteKind[] = ['gain', 'cost', 'watch'];
const isSpeech = (html: string) => /^(<[^>]+>)*[“"]/.test(html);

type Phase = 'story' | 'staged' | 'rolled' | 'ended';
type Draft = GameEvent extends infer E ? (E extends GameEvent ? Omit<E, 'id'> : never) : never;

export interface SessionOptions extends RunOptions {
  inkJson: string;
  data: GameData;
  rng?: Rng;
  saved?: SaveData | null;
}

export class GameSession {
  readonly store: StoreApi<GameView>;
  private story!: Story;
  private game!: GameState;
  private run!: RunController;
  private events: GameEvent[] = [];
  private nextId = 1;
  private phase: Phase = 'story';
  private request: CheckRequest | null = null;
  private setup: AssistedRollSetup | null = null;
  private pending: RollResult | null = null;
  private checkIndex = -1;
  private showOdds = false;
  private bg = 'hall';
  private snapshot: SaveData | null = null;
  private errors: string[] = [];

  constructor(private opts: SessionOptions) {
    this.store = createStore<GameView>(() => ({}) as GameView);
    this.init(opts.saved ?? null);
  }

  // ---- lifecycle ---------------------------------------------------------------------

  restart(): void {
    this.init(null);
  }

  private init(saved: SaveData | null): void {
    const { data, inkJson } = this.opts;
    this.errors = [];
    this.run = new RunController(data, this.opts);
    this.story = new Story(inkJson);
    this.story.onError = msg => this.errors.push(msg);
    this.bindExternals();
    this.game = newGameState(data.rules);
    this.events = [];
    this.nextId = 1;
    this.phase = 'story';
    this.showOdds = false;
    this.request = this.setup = this.pending = this.snapshot = null;
    this.bg = 'hall';
    if (saved?.v === 3) {
      this.restore(saved);
    } else {
      this.rewards();
      this.run.refresh(this.game, this.flags());
    }
    this.publish();
  }

  /** A staged or unresolved roll saves the full state before its choice. */
  save(): SaveData {
    return structuredClone(
      this.snapshot && (this.phase === 'staged' || this.phase === 'rolled')
        ? this.snapshot
        : {
            v: 3,
            ink: this.story.state.toJson(),
            res: this.game.res,
            ledger: this.game.ledger,
            events: this.events,
            bg: this.bg,
            run: this.run.state,
          },
    );
  }

  private restore(saved: SaveData): void {
    validateSave(saved, this.opts.data);
    const s = structuredClone(saved);
    this.story.state.LoadJson(s.ink);
    this.game = { res: s.res, ledger: s.ledger };
    delete this.game.res.Pursuit;
    this.run.state = s.run;
    this.events = s.events;
    this.bg = s.bg;
    this.nextId = Math.max(0, ...s.events.map(e => e.id)) + 1;
    this.snapshot = null;
    this.request = this.setup = this.pending = null;
    this.showOdds = false;
    this.phase = 'story';
    if (this.run.state.phase === 'scene') this.refreshChoices();
  }

  private flags(): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    const names = new Set(
      [...this.opts.data.encounters, ...this.opts.data.keystones].flatMap(entry => entry.requires.flags ?? []),
    );
    for (const name of names) flags[name] = this.story.variablesState.$(name) === true;
    return flags;
  }

  pickOffer(id: string): void {
    this.run.pick(id);
    this.publish();
  }
  assign(value: Assignments): void {
    this.run.assign(value);
    this.publish();
  }
  cancelPrepare(): void {
    this.run.cancel();
    this.publish();
  }
  confirm(): void {
    this.run.require('prepare');
    const before = this.save();
    try {
      this.run.confirm(this.game);
      this.story.ChoosePathString(this.run.state.active!.entry.knot);
      this.phase = 'story';
      this.snapshot = null;
      this.advance();
      this.publish();
    } catch (error) {
      this.restore(before);
      this.errors = [];
      this.publish();
      throw error;
    }
  }
  endCycle(): void {
    const credits = this.game.res.Credits ?? 0;
    this.game = this.run.end(this.game, this.flags());
    const note: LedgerNote = {
      kind: 'cost',
      t: '',
      command: { code: 'cycleUpkeep', amount: credits - (this.game.res.Credits ?? 0) },
    };
    this.game.ledger.push(note);
    this.push({ type: 'note', ...note });
    this.rewards();
    this.publish();
  }

  private rewards(): void {
    const { game, notes } = this.run.rewards(this.game);
    this.game = game;
    this.game.ledger.push(...notes);
    for (const note of notes) this.push({ type: 'note', ...note });
  }

  // ---- player input ------------------------------------------------------------------

  /** id is a story choice index (number) or 'try' | 'odds' | 'back' | 'edge' | 'accept'. */
  act(id: number | string): void {
    if (!this.choices().some(choice => choice.id === id)) throw new Error(`Action unavailable: ${id}`);
    if (id === 'restart') return this.restart();
    if (typeof id === 'string' && id.startsWith('offer:')) return this.pickOffer(id.slice(6));
    if (id === 'restart') return this.restart();
    if (id === 'confirm') return this.confirm();
    if (id === 'cancel') return this.cancelPrepare();
    if (id === 'endCycle') return this.endCycle();
    if (typeof id === 'string' && id.startsWith('ship:'))
      return this.assign({ ...this.run.state.assignments, shipId: id.slice(5) });
    if (typeof id === 'string' && id.startsWith('crew:')) {
      const crewId = id.slice(5),
        current = this.run.state.assignments;
      return this.assign({
        ...current,
        crewIds: current.crewIds.includes(crewId)
          ? current.crewIds.filter(c => c !== crewId)
          : [...current.crewIds, crewId],
      });
    }
    if (typeof id === 'number') this.pick(id);
    else if (id === 'odds') this.showOdds = true;
    else if (id === 'back') this.back();
    else if (id === 'try') this.try();
    else if (id === 'edge') this.edge();
    else if (id === 'accept') this.finalize(this.pending!.grade);
    this.publish();
  }

  private pick(index: number): void {
    const choice = this.story.currentChoices[index];
    if (!choice) throw new Error(`No story choice ${index}`);
    this.snapshot = this.save();
    this.push({ type: 'pick', html: choice.text });
    this.story.ChooseChoiceIndex(index);
    this.advance();
  }

  private back(): void {
    const s = this.snapshot;
    if (!s) return;
    this.restore(s);
  }

  private dice: Rng = () => {
    if (this.opts.rng) return this.opts.rng();
    const rng = createSeededRng(this.run.state.rngState);
    const dice: ReturnType<Rng> = [1 + Math.floor(rng.next() * 6), 1 + Math.floor(rng.next() * 6)];
    this.run.state.rngState = rng.getState();
    return dice;
  };

  private try(): void {
    this.pending = makeRoll(this.setup!, this.opts.data.rules, this.dice);
    this.push({ type: 'roll', ...this.pending });
    if (this.pending.grade !== 'clean' && (this.game.res.Edge ?? 0) > 0) this.phase = 'rolled';
    else this.finalize(this.pending.grade);
  }

  private edge(): void {
    addResource(this.game.res, this.opts.data.rules, 'Edge', -1);
    this.pending = spendEdge(this.pending!, this.setup!, this.opts.data.rules, this.dice);
    this.push({ type: 'roll', ...this.pending });
    this.finalize(this.pending.grade);
  }

  private finalize(grade: Grade): void {
    this.story.variablesState['roll_grade'] = GRADE_VALUE[grade];
    this.story.ChooseChoiceIndex(this.checkIndex);
    this.pending = null;
    this.request = this.setup = null;
    this.snapshot = null;
    this.showOdds = false;
    this.advance();
  }

  // ---- story plumbing ----------------------------------------------------------------

  private bindExternals(): void {
    const { rules } = this.opts.data;
    this.story.BindExternalFunction('res', (name: string) => {
      if (name === 'Pursuit') return this.run.state.cycle.pursuit.value;
      if (!(name in rules.resources))
        throw new Error(`res("${name}"): unknown resource. Known: ${Object.keys(rules.resources).join(', ')}, Pursuit`);
      return this.game.res[name] ?? 0;
    });
    this.story.BindExternalFunction('add', (name: string, n: number) => {
      if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error('Resource delta must be a finite integer');
      if (name !== 'Pursuit' && !(name in rules.resources))
        throw new Error(`Unknown resource ${name}. Known: ${Object.keys(rules.resources).join(', ')}, Pursuit`);
      if (name !== 'Pursuit') return addResource(this.game.res, rules, name, n);
      const clock = this.run.state.cycle.pursuit;
      return (clock.value = Math.max(0, Math.min(clock.length, clock.value + n)));
    });
    this.story.BindExternalFunction('trust', (id: string, delta: number) => {
      this.run.state.crewTrust = changeTrust(this.run.state.crewTrust, id, delta);
      this.rewards();
      return this.run.state.crewTrust[id];
    });
    this.story.BindExternalFunction('note', (kind: string, t: string) => {
      if (!NOTE_KINDS.includes(kind as NoteKind))
        throw new Error(`note("${kind}", ...): kind must be ${NOTE_KINDS.join(', ')}`);
      const note = { kind: kind as NoteKind, t };
      this.game.ledger.push(note);
      this.push({ type: 'note', ...note });
    });
  }

  private advance(): void {
    while (this.story.canContinue) {
      const text = (this.story.Continue() ?? '').trim();
      const tags = this.story.currentTags ?? [];
      for (const tag of tags) if (tag.startsWith('bg:')) this.bg = tag.slice(3).trim();
      if (text) this.push({ type: 'para', html: text, speech: isSpeech(text) });
      if (tags.includes('summary')) this.push({ type: 'summary', items: [...this.game.ledger] });
    }
    this.refreshChoices();
    if (this.errors.length) {
      const e = this.errors.splice(0);
      throw new Error(`ink runtime error:\n${e.join('\n')}`);
    }
  }

  /** Decide whether the story is waiting on a player choice, a roll, or has ended. */
  private refreshChoices(): void {
    const choices = this.story.currentChoices;
    const end = choices.find(c => c.text === '__scene_end__');
    if (end) {
      this.story.ChooseChoiceIndex(end.index);
      while (this.story.canContinue) this.story.Continue();
      this.snapshot = null;
      this.phase = 'story';
      this.run.finish(this.game, this.flags());
      return;
    }
    this.checkIndex = choices.findIndex(c => c.text === CHECK_CHOICE);
    if (this.checkIndex >= 0) {
      const v = this.story.variablesState;
      this.request = {
        skills: String(v['chk_skills'])
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        target: Number(v['chk_target']),
        bonuses: String(v['chk_bonus'])
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };
      this.setup = assistedSetup(
        this.opts.data,
        this.request,
        flag => v[flag] === true,
        this.run.state.assignments.crewIds,
        this.run.state.crewTrust,
      );
      this.phase = 'staged';
    } else {
      if (!choices.length) throw new Error('Scene ended without scene_end');
      this.phase = 'story';
    }
  }

  private push(e: Draft): void {
    this.events.push({ ...e, id: this.nextId++ } as GameEvent);
  }

  // ---- view --------------------------------------------------------------------------

  private choices(): UIChoice[] {
    if (this.run.state.phase !== 'scene') return runChoices(this.run.state, this.opts.data, this.game.res);
    if (this.phase === 'ended') return [];
    if (this.phase === 'staged') {
      return [
        { id: 'try', kind: 'try', text: '', command: { code: 'try' } },
        { id: 'odds', kind: 'odds', text: '', command: { code: 'odds' } },
        { id: 'back', kind: 'back', text: '', command: { code: 'back' } },
      ];
    }
    if (this.phase === 'rolled') {
      const fail = this.pending!.grade === 'fail';
      return [
        {
          id: 'edge',
          kind: 'edge',
          text: '',
          command: { code: 'edge', reroll: fail, left: this.game.res.Edge ?? 0 },
        },
        { id: 'accept', kind: 'accept', text: '', command: { code: 'accept' } },
      ];
    }
    return this.story.currentChoices.map(c => {
      const hint = c.tags?.find(t => t.startsWith('hint:'));
      return { id: c.index, kind: 'choice' as const, text: c.text, ...(hint ? { sub: hint.slice(5).trim() } : {}) };
    });
  }

  private publish(): void {
    this.store.setState(
      structuredClone({
        events: this.events,
        choices: this.choices(),
        odds:
          this.phase === 'staged' && this.showOdds && this.setup
            ? { ...oddsOf(this.setup, this.opts.data.rules), parts: this.setup.parts }
            : null,
        bg: this.bg,
        ended: this.run.state.phase === 'ended',
        phase: this.run.state.phase,
        offers: this.run.state.offers,
        ...preparationProjection(this.run.state, this.opts.data, this.game.res),
        cycle: this.run.state.cycle,
        pursuitFull: this.run.state.cycle.pursuit.value === this.run.state.cycle.pursuit.length,
        crewTrust: this.run.state.crewTrust,
        assignments: this.run.state.assignments,
        busyCrewIds: this.run.state.busyCrewIds,
        boardStatus: this.run.state.boardStatus,
        hub:
          this.run.state.phase === 'hub'
            ? {
                cycle: this.run.state.cycle.cycle,
                actionsLeft: this.run.state.cycle.actionsLeft,
                board: this.run.state.boardStatus,
              }
            : null,
        schedulerStatus: this.run.configured ? 'configured' : 'unconfigured',
        unmetGuarantees: this.run.state.unmetGuarantees,
        blockedDue: this.run.state.blockedDue,
        commercialReplacement: this.run.state.commercialReplacement,
        res: { ...this.game.res },
        ledger: [...this.game.ledger],
      }),
      true,
    );
  }
}

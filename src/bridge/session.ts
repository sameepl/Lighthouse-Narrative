// Glue between the ink story (writing), the rules engine (numbers) and the UI.
//
// Ownership: ink owns narrative flags and what happens next; the engine owns resources and dice.
// The story calls res/add/note (see story/lib/world.ink) and pauses at roll() (story/lib/roll.ink),
// where this session runs the interactive roll and then tells the story which outcome happened.
import { Story } from 'inkjs';
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { GameData } from '../data/validate';
import { addResource, makeRoll, newGameState, oddsOf, setupRoll, spendEdge } from '../engine/rules';
import type { CheckRequest, GameState, Grade, NoteKind, Rng, RollResult, RollSetup } from '../engine/types';
import type { GameEvent, GameView, SaveData, UIChoice } from './types';

const CHECK_CHOICE = '__check__';
const GRADE_VALUE: Record<Grade, number> = { clean: 2, cost: 1, fail: 0 };
const NOTE_KINDS: NoteKind[] = ['gain', 'cost', 'watch'];
const isSpeech = (html: string) => /^(<[^>]+>)*[“"]/.test(html);

type Phase = 'story' | 'staged' | 'rolled' | 'ended';
type Draft = GameEvent extends infer E ? (E extends GameEvent ? Omit<E, 'id'> : never) : never;

export interface SessionOptions {
  inkJson: string;
  data: GameData;
  rng?: Rng;
  saved?: SaveData | null;
}

export class GameSession {
  readonly store: StoreApi<GameView>;
  private story!: Story;
  private game!: GameState;
  private events: GameEvent[] = [];
  private nextId = 1;
  private phase: Phase = 'story';
  private request: CheckRequest | null = null;
  private setup: RollSetup | null = null;
  private pending: RollResult | null = null;
  private checkIndex = -1;
  private showOdds = false;
  private bg = 'hall';
  private snapshot: { ink: string; res: Record<string, number>; ledger: GameState['ledger']; eventsLen: number } | null = null;
  private errors: string[] = [];

  constructor(private opts: SessionOptions) {
    this.store = createStore<GameView>(() => ({
      events: [], choices: [], odds: null, bg: 'hall', ended: false, res: {}, ledger: [],
    }));
    this.init(opts.saved ?? null);
  }

  // ---- lifecycle ---------------------------------------------------------------------

  restart(): void { this.init(null); }

  private init(saved: SaveData | null): void {
    const { data, inkJson } = this.opts;
    this.story = new Story(inkJson);
    this.story.onError = msg => this.errors.push(msg);
    this.bindExternals();
    this.game = newGameState(data.rules);
    this.events = []; this.nextId = 1; this.phase = 'story'; this.showOdds = false;
    this.request = this.setup = this.pending = this.snapshot = null; this.bg = 'hall';
    if (saved) {
      this.story.state.LoadJson(saved.ink);
      this.game = { res: { ...saved.res }, ledger: [...saved.ledger] };
      this.events = [...saved.events];
      this.nextId = Math.max(0, ...saved.events.map(e => e.id)) + 1;
      this.refreshChoices();
    } else {
      this.advance();
    }
    this.publish();
  }

  /** What to persist. Mid-roll, we save the state from before the choice was picked. */
  save(): SaveData {
    const snap = this.phase === 'story' || this.phase === 'ended' ? null : this.snapshot;
    return {
      v: 1,
      ink: snap ? snap.ink : this.story.state.toJson(),
      res: snap ? { ...snap.res } : { ...this.game.res },
      ledger: snap ? [...snap.ledger] : [...this.game.ledger],
      events: snap ? this.events.slice(0, snap.eventsLen) : [...this.events],
    };
  }

  // ---- player input ------------------------------------------------------------------

  /** id is a story choice index (number) or 'try' | 'odds' | 'back' | 'edge' | 'accept'. */
  act(id: number | string): void {
    if (typeof id === 'number') this.pick(id);
    else if (id === 'odds') { this.showOdds = true; }
    else if (id === 'back') this.back();
    else if (id === 'try') this.try();
    else if (id === 'edge') this.edge();
    else if (id === 'accept') this.finalize(this.pending!.grade);
    else throw new Error(`Unknown action "${id}"`);
    this.publish();
  }

  private pick(index: number): void {
    const choice = this.story.currentChoices[index];
    if (!choice) throw new Error(`No story choice ${index}`);
    this.snapshot = { ink: this.story.state.toJson(), res: { ...this.game.res }, ledger: [...this.game.ledger], eventsLen: this.events.length };
    this.push({ type: 'pick', html: choice.text });
    this.story.ChooseChoiceIndex(index);
    this.advance();
  }

  private back(): void {
    const s = this.snapshot;
    if (!s) return;
    this.story.state.LoadJson(s.ink);
    this.game = { res: { ...s.res }, ledger: [...s.ledger] };
    this.events.length = s.eventsLen;
    this.showOdds = false; this.pending = null;
    this.refreshChoices();
  }

  private try(): void {
    this.pending = makeRoll(this.setup!, this.opts.data.rules, this.opts.rng);
    this.push({ type: 'roll', ...this.pending });
    if (this.pending.grade !== 'clean' && (this.game.res.Edge ?? 0) > 0) this.phase = 'rolled';
    else this.finalize(this.pending.grade);
  }

  private edge(): void {
    addResource(this.game.res, this.opts.data.rules, 'Edge', -1);
    this.pending = spendEdge(this.pending!, this.setup!, this.opts.data.rules, this.opts.rng);
    this.push({ type: 'roll', ...this.pending });
    this.finalize(this.pending.grade);
  }

  private finalize(grade: Grade): void {
    this.story.variablesState['roll_grade'] = GRADE_VALUE[grade];
    this.story.ChooseChoiceIndex(this.checkIndex);
    this.pending = null; this.request = this.setup = null; this.snapshot = null; this.showOdds = false;
    this.advance();
  }

  // ---- story plumbing ----------------------------------------------------------------

  private bindExternals(): void {
    const { rules } = this.opts.data;
    this.story.BindExternalFunction('res', (name: string) => {
      if (!(name in rules.resources)) throw new Error(`res("${name}"): unknown resource`);
      return this.game.res[name] ?? 0;
    });
    this.story.BindExternalFunction('add', (name: string, n: number) => addResource(this.game.res, rules, name, n));
    this.story.BindExternalFunction('note', (kind: string, t: string) => {
      if (!NOTE_KINDS.includes(kind as NoteKind)) throw new Error(`note("${kind}", ...): kind must be ${NOTE_KINDS.join(', ')}`);
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
    if (this.errors.length) { const e = this.errors.splice(0); throw new Error(`ink runtime error:\n${e.join('\n')}`); }
  }

  /** Decide whether the story is waiting on a player choice, a roll, or has ended. */
  private refreshChoices(): void {
    const choices = this.story.currentChoices;
    this.checkIndex = choices.findIndex(c => c.text === CHECK_CHOICE);
    if (this.checkIndex >= 0) {
      const v = this.story.variablesState;
      this.request = {
        skills: String(v['chk_skills']).split(',').map(s => s.trim()).filter(Boolean),
        target: Number(v['chk_target']),
        bonuses: String(v['chk_bonus']).split(',').map(s => s.trim()).filter(Boolean),
      };
      this.setup = setupRoll(this.opts.data.character, this.opts.data.rules, this.request, flag => v[flag] === true);
      this.phase = 'staged';
    } else {
      this.phase = choices.length ? 'story' : 'ended';
    }
  }

  private push(e: Draft): void { this.events.push({ ...e, id: this.nextId++ } as GameEvent); }

  // ---- view --------------------------------------------------------------------------

  private choices(): UIChoice[] {
    if (this.phase === 'ended') return [];
    if (this.phase === 'staged') {
      return [{ id: 'try', kind: 'try', text: 'Try it' }, { id: 'odds', kind: 'odds', text: 'Odds' }, { id: 'back', kind: 'back', text: 'Back' }];
    }
    if (this.phase === 'rolled') {
      const fail = this.pending!.grade === 'fail';
      return [
        { id: 'edge', kind: 'edge', text: `Spend Edge: ${fail ? 're-roll' : 'make it clean'}`, sub: `${this.game.res.Edge} left` },
        { id: 'accept', kind: 'accept', text: 'Accept the result' },
      ];
    }
    return this.story.currentChoices.map(c => {
      const hint = c.tags?.find(t => t.startsWith('hint:'));
      return { id: c.index, kind: 'choice' as const, text: c.text, ...(hint ? { sub: hint.slice(5).trim() } : {}) };
    });
  }

  private publish(): void {
    this.store.setState({
      events: [...this.events],
      choices: this.choices(),
      odds: this.phase === 'staged' && this.showOdds && this.setup ? oddsOf(this.setup, this.opts.data.rules) : null,
      bg: this.bg,
      ended: this.phase === 'ended',
      res: { ...this.game.res },
      ledger: [...this.game.ledger],
    }, true);
  }
}

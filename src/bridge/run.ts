import type { GameData } from '../data/validate';
import { availableCrew } from './crew';
import { assignmentReasons, confirmationReasons, preparationError } from './view';
import { buildBoard } from '../engine/board';
import { earnEdge, endCycle, newCycleState } from '../engine/cycle';
import { scheduleKeystones, type KeystoneRoles } from '../engine/keystones';
import { createSeededRng } from '../engine/rng';
import { addResource } from '../engine/rules';
import type { GameState } from '../engine/types';
import type { Assignments, LedgerNote, RunState, UpkeepProjection } from './types';

export interface RunOptions {
  seed?: number;
  slice?: boolean;
  gear?: readonly string[];
  keystoneRoles?: KeystoneRoles;
}
const emptyAssignments = (): Assignments => ({ shipId: null, crewIds: [] });

/** Bridge scheduling adapter. Engine functions own all rule calculations. */
export class RunController {
  state: RunState;
  readonly slice: boolean;
  constructor(
    private data: GameData,
    private options: RunOptions,
  ) {
    this.slice = options.slice ?? (data.season.status === 'configured' && !data.season.full);
    if (!this.slice && data.season.status === 'configured' && !data.season.full)
      throw new Error('Full mode is not configured for this season');
    this.state = {
      ending: null,
      phase: 'hub',
      cycle: newCycleState(data.rules, this.slice),
      crewTrust: Object.fromEntries(data.crew.map(member => [member.id, member.trust])),
      rngState: createSeededRng(options.seed ?? 0).getState(),
      played: [],
      completed: [],
      leads: [],
      assignments: emptyAssignments(),
      busyCrewIds: [],
      active: null,
      offers: [],
      encounterBoard: null,
      boardStatus: 'no-eligible-offers',
      unmetGuarantees: [],
      blockedDue: [],
      commercialReplacement: false,
    };
  }
  private get keystoneRoles(): KeystoneRoles | undefined {
    return (
      this.options.keystoneRoles ??
      (this.data.season.status === 'configured' ? this.data.season[this.slice ? 'slice' : 'full'] : undefined)
    );
  }
  get configured(): boolean {
    return this.data.keystones.length > 0 && this.keystoneRoles !== undefined;
  }
  private get tutorial() {
    if (!this.slice || this.data.season.status !== 'configured') return undefined;
    const id = this.data.season.slice.tutorialId;
    return this.data.encounters.find(entry => entry.id === id);
  }
  private get pursuitFullPolicy(): 'forceFinale' | 'hardenFinale' {
    return this.slice && this.data.season.status === 'configured'
      ? (this.data.season.pursuitFull ?? 'forceFinale')
      : 'forceFinale';
  }
  require(phase: RunState['phase']): void {
    if (this.state.phase !== phase) throw new Error(`Action requires ${phase} phase`);
  }
  refresh(game: GameState, flags: Record<string, boolean>): void {
    const s = this.state;
    s.offers = [];
    s.blockedDue = [];
    s.unmetGuarantees = [];
    s.commercialReplacement = false;
    if (s.phase === 'ended') {
      s.boardStatus = 'ended';
      return;
    }
    const tutorial = this.tutorial;
    if (
      tutorial &&
      s.cycle.cycle === 1 &&
      s.cycle.actionsLeft === 2 &&
      s.played.length === 0 &&
      !s.completed.includes(this.keystoneRoles!.firstId)
    ) {
      s.offers = [{ kind: 'encounter', entry: tutorial, forced: true, weak: false }];
      s.boardStatus = 'ready';
      return;
    }
    const crew = availableCrew(this.data, s.busyCrewIds);
    const common = { resources: game.res, ships: this.data.ships, crew, gear: this.options.gear ?? [], flags };
    const scheduled = this.configured
      ? scheduleKeystones({
          ...common,
          cycle: s.cycle,
          leads: s.leads,
          completed: s.completed,
          keystones: this.data.keystones,
          roles: this.keystoneRoles!,
          pursuitFull: this.pursuitFullPolicy,
        })
      : null;
    if (scheduled?.ended) {
      s.phase = 'ended';
      s.boardStatus = 'ended';
      return;
    }
    s.blockedDue = scheduled?.blockedDue ?? [];
    s.commercialReplacement = scheduled?.commercialReplacement ?? false;
    if (s.cycle.actionsLeft === 0) {
      s.boardStatus = 'actions-spent';
      return;
    }
    const keys =
      scheduled?.offers.map(o => ({ kind: 'keystone' as const, entry: o.keystone, forced: o.forced, weak: o.weak })) ??
      [];
    const forced = keys.filter(o => o.forced);
    if (forced.length) {
      s.offers = forced;
      s.boardStatus = 'ready';
      return;
    }
    if (s.cycle.pursuit.value >= s.cycle.pursuit.length && this.pursuitFullPolicy === 'forceFinale') {
      s.offers = keys;
      s.boardStatus = keys.length ? 'ready' : 'pursuit-full';
      return;
    }
    const rng = createSeededRng(s.rngState);
    const roles = this.keystoneRoles;
    const roleIds = roles ? [roles.firstId, ...roles.middleIds, roles.finaleId] : [];
    const dueLead = this.configured
      ? [...this.data.keystones]
          .filter(
            key =>
              roleIds.includes(key.id) &&
              !s.completed.includes(key.id) &&
              key.availableWhen.lead &&
              !s.leads.includes(key.availableWhen.lead),
          )
          .sort((a, b) => a.deadline - b.deadline || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0]?.availableWhen.lead
      : undefined;
    const board = buildBoard(
      {
        ...common,
        cycle: s.cycle.cycle,
        encounters: s.encounterBoard ?? this.data.encounters,
        played: s.played,
        dueLead,
      },
      rng,
    );
    if (s.encounterBoard === null) {
      s.encounterBoard = board.offers;
      s.rngState = rng.getState();
    }
    s.offers = [
      ...keys,
      ...board.offers.map(entry => ({
        kind: 'encounter' as const,
        entry,
        forced: false as const,
        weak: false as const,
      })),
    ];
    s.unmetGuarantees = board.unmetGuarantees;
    s.boardStatus = s.offers.length ? 'ready' : 'no-eligible-offers';
  }
  pick(id: string): void {
    this.require('hub');
    const offer = this.state.offers.find(o => o.entry.id === id);
    if (!offer || this.state.cycle.actionsLeft <= 0) throw new Error(`Offer unavailable: ${id}`);
    this.state.active = offer;
    this.state.assignments = emptyAssignments();
    this.state.phase = 'prepare';
  }
  assign(value: Assignments): void {
    this.require('prepare');
    this.validateAssignments(value);
    this.state.assignments = structuredClone(value);
  }
  private validateAssignments(value: Assignments): void {
    const reason = assignmentReasons(value, this.state, this.data)[0];
    if (reason) throw new Error(preparationError(reason));
  }
  cancel(): void {
    this.require('prepare');
    this.state.active = null;
    this.state.assignments = emptyAssignments();
    this.state.phase = 'hub';
  }
  confirm(game: GameState): void {
    this.require('prepare');
    const s = this.state,
      offer = s.active!;
    const reason = confirmationReasons(s, this.data, game.res)[0];
    if (reason) throw new Error(preparationError(reason));
    const cost = offer.kind === 'encounter' ? offer.entry.cost : 0;
    addResource(game.res, this.data.rules, 'Credits', -cost);
    if (offer.kind === 'encounter') s.played.push({ id: offer.entry.id, cycle: s.cycle.cycle });
    s.cycle.actionsLeft--;
    s.busyCrewIds.push(...s.assignments.crewIds);
    s.phase = 'scene';
  }
  finish(game: GameState, flags: Record<string, boolean>): void {
    this.require('scene');
    const s = this.state;
    if (s.ending === 'foreclosure') {
      s.ending = null;
      s.phase = 'ended';
      return;
    }
    const offer = s.active!;
    if (offer.kind === 'encounter') {
      if (offer.entry.lead && !s.leads.includes(offer.entry.lead)) s.leads.push(offer.entry.lead);
    } else s.completed.push(offer.entry.id);
    s.active = null;
    s.assignments = emptyAssignments();
    s.phase = 'hub';
    this.refresh(game, flags);
  }
  /** Pure preview and committed settlement share exactly one engine calculation. */
  private settlement(game: GameState) {
    const result = endCycle(this.state.cycle, game, this.data.ships, {}, this.data.rules);
    const before = (name: string) => game.res[name] ?? this.data.rules.resources[name]!.start;
    const projection: UpkeepProjection = {
      upkeepDue: result.report.upkeepDue,
      upkeepPaid: result.report.upkeep,
      upkeepShortfall: result.cycle.upkeepShortfall,
      arrearsBefore: this.state.cycle.arrears,
      arrearsAfter: result.cycle.arrears,
      renownLost: before('Renown') - (result.game.res.Renown ?? before('Renown')),
      strainAdded: (result.game.res.Strain ?? before('Strain')) - before('Strain'),
      pursuitDelta: result.report.pursuitDelta,
      warning:
        !result.cycle.failed &&
        result.cycle.arrears >= this.data.rules.cycle.upkeep.arrearsLimit - this.data.rules.cycle.upkeep.warningLead,
      failed: result.cycle.failed,
    };
    return { ...result, projection };
  }
  preview(game: GameState): UpkeepProjection {
    return this.settlement(game).projection;
  }
  end(game: GameState, flags: Record<string, boolean>): { game: GameState; projection: UpkeepProjection } {
    this.require('hub');
    if (this.state.boardStatus === 'pursuit-full' || this.state.offers.some(o => o.forced))
      throw new Error('Resolve Pursuit or the forced keystone first');
    const result = this.settlement(game);
    this.state.cycle = result.cycle;
    if (result.cycle.failed) {
      this.state.ending = 'foreclosure';
      this.state.phase = 'scene';
      this.state.active = null;
      this.state.offers = [];
      this.state.blockedDue = [];
      this.state.unmetGuarantees = [];
      this.state.commercialReplacement = false;
      this.state.boardStatus = 'ended';
    }
    this.state.busyCrewIds = [];
    this.state.assignments = emptyAssignments();
    this.state.encounterBoard = null;
    if (!result.cycle.failed) this.refresh(result.game, flags);
    return { game: result.game, projection: result.projection };
  }
  rewards(game: GameState): { game: GameState; notes: LedgerNote[] } {
    const notes: LedgerNote[] = [];
    for (const crew of this.data.crew) {
      const result = earnEdge(this.state.cycle, game, crew, this.state.crewTrust[crew.id]!, this.data.rules);
      this.state.cycle = result.cycle;
      game = result.game;
      if (result.report.rewardConsumed)
        notes.push({
          kind: result.report.edgeAdded ? 'gain' : 'watch',
          t: '',
          command: { code: 'trustReward', crewId: crew.id, name: crew.name, edgeAdded: result.report.edgeAdded },
        });
    }
    return { game, notes };
  }
}

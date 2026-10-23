import type { GameData } from '../data/validate';
import { buildBoard } from '../engine/board';
import { earnEdge, endCycle, newCycleState } from '../engine/cycle';
import { scheduleKeystones, type KeystoneRoles } from '../engine/keystones';
import { createSeededRng } from '../engine/rng';
import { addResource } from '../engine/rules';
import type { GameState } from '../engine/types';
import type { Assignments, LedgerNote, RunState } from './types';

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
  constructor(
    private data: GameData,
    private options: RunOptions,
  ) {
    this.state = {
      phase: 'hub',
      cycle: newCycleState(data.rules, options.slice),
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
  get configured(): boolean {
    return this.data.keystones.length > 0 && this.options.keystoneRoles !== undefined;
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
    const crew = this.data.crew.filter(c => !s.busyCrewIds.includes(c.id));
    const common = { resources: game.res, ships: this.data.ships, crew, gear: this.options.gear ?? [], flags };
    const scheduled = this.configured
      ? scheduleKeystones({
          ...common,
          cycle: s.cycle,
          leads: s.leads,
          completed: s.completed,
          keystones: this.data.keystones,
          roles: this.options.keystoneRoles!,
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
    if (s.cycle.pursuit.value >= s.cycle.pursuit.length) {
      s.offers = keys;
      s.boardStatus = keys.length ? 'ready' : 'pursuit-full';
      return;
    }
    const rng = createSeededRng(s.rngState);
    const dueLead = this.configured
      ? [...this.data.keystones]
          .filter(
            key => !s.completed.includes(key.id) && key.availableWhen.lead && !s.leads.includes(key.availableWhen.lead),
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
    if (value.shipId !== null && !this.data.ships.some(s => s.id === value.shipId)) throw new Error('Unknown ship');
    if (new Set(value.crewIds).size !== value.crewIds.length) throw new Error('Duplicate crew assignment');
    for (const id of value.crewIds)
      if (!this.data.crew.some(c => c.id === id) || this.state.busyCrewIds.includes(id))
        throw new Error(`Crew unavailable: ${id}`);
    this.state.assignments = structuredClone(value);
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
      offer = s.active!,
      req = offer.entry.requires;
    const ship = this.data.ships.find(ship => ship.id === s.assignments.shipId);
    if (req.shipTag && (!ship || !ship.tags.includes(req.shipTag))) throw new Error('Assign a suitable ship');
    if ((req.crew ?? []).some(id => !s.assignments.crewIds.includes(id))) throw new Error('Assign the required crew');
    const cost = offer.kind === 'encounter' ? offer.entry.cost : 0;
    if ((game.res.Credits ?? 0) < cost) throw new Error('Insufficient Credits');
    if (s.cycle.actionsLeft <= 0) throw new Error('No actions left');
    addResource(game.res, this.data.rules, 'Credits', -cost);
    if (offer.kind === 'encounter') s.played.push({ id: offer.entry.id, cycle: s.cycle.cycle });
    s.cycle.actionsLeft--;
    s.busyCrewIds.push(...s.assignments.crewIds);
    s.phase = 'scene';
  }
  finish(game: GameState, flags: Record<string, boolean>): void {
    this.require('scene');
    const s = this.state,
      offer = s.active!;
    if (offer.kind === 'encounter') {
      if (offer.entry.lead && !s.leads.includes(offer.entry.lead)) s.leads.push(offer.entry.lead);
    } else s.completed.push(offer.entry.id);
    s.active = null;
    s.assignments = emptyAssignments();
    s.phase = 'hub';
    this.refresh(game, flags);
  }
  end(game: GameState, flags: Record<string, boolean>): GameState {
    this.require('hub');
    if (this.state.boardStatus === 'pursuit-full' || this.state.offers.some(o => o.forced))
      throw new Error('Resolve Pursuit or the forced keystone first');
    const result = endCycle(this.state.cycle, game, this.data.ships, {}, this.data.rules);
    this.state.cycle = result.cycle;
    this.state.busyCrewIds = [];
    this.state.assignments = emptyAssignments();
    this.state.encounterBoard = null;
    this.refresh(result.game, flags);
    return result.game;
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

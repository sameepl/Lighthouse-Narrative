import { describe, expect, it } from 'vitest';
import { commandText, hubStatusText } from '../src/ui/strings';
import { GameSession } from '../src/bridge/session';
import { data } from '../src/data';
import ink from '../src/story/main.ink';

describe('hub and command strings', () => {
  it('pluralises actions left', () => {
    expect(hubStatusText({ cycle: 1, actionsLeft: 1, board: 'ready' })).toContain('1 action left');
    expect(hubStatusText({ cycle: 1, actionsLeft: 2, board: 'ready' })).toContain('2 actions left');
    expect(hubStatusText({ cycle: 1, actionsLeft: 0, board: 'actions-spent' })).toContain('0 actions left');
  });

  it('writes the end-cycle and cancel hints from codes', () => {
    expect(commandText({ code: 'endCycle', actionsLeft: 1, noEligibleOffers: true }).sub).toBe(
      '1 action left. Pay ship upkeep and advance Pursuit. No eligible offers.',
    );
    expect(commandText({ code: 'cancel', ready: false }).sub).toMatch(/^Not ready/);
    expect(commandText({ code: 'cancel', ready: true }).sub).toMatch(/^Return without spending/);
  });

  it('names an offer, a ship and a crew assignment', () => {
    expect(
      commandText({
        code: 'offer',
        offerId: 'written_clause',
        offerKind: 'encounter',
        cost: 0,
        risk: 'low',
        locked: false,
        forced: false,
        crew: [],
      }),
    ).toEqual({ text: 'written clause', sub: 'Cost Cr0. low' });
    expect(commandText({ code: 'ship', shipId: 's', name: 'Pawn', tags: ['fast', 'quiet'], selected: true })).toEqual({
      text: 'Selected: Pawn',
      sub: 'fast, quiet',
    });
    expect(commandText({ code: 'crew', crewId: 'c', name: 'Priya', skill: 'Leadership', assigned: false })).toEqual({
      text: 'Assign Priya',
      sub: 'Leadership assist',
    });
  });
});

describe('the bridge sends data, not sentences', () => {
  it('hub and prepare commands carry codes and no text; the hub is data, not a feed event', () => {
    const s = new GameSession({ data, inkJson: ink, seed: 3 });
    const hub = s.store.getState();
    expect(hub.hub).toMatchObject({ cycle: 1, actionsLeft: 2 });
    expect(hub.events.some(e => e.id === -1)).toBe(false);
    expect(hub.choices.length).toBeGreaterThan(0);
    for (const c of hub.choices) {
      expect(c.command).toBeDefined();
      expect(c.text).toBe('');
      expect(c.sub).toBeUndefined();
    }
    s.pickOffer(hub.offers[0]!.entry.id);
    const prepare = s.store.getState();
    expect(prepare.hub).toBeNull();
    for (const c of prepare.choices) expect(c.text).toBe('');
  });
});

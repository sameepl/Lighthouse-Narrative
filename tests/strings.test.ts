import { describe, expect, it } from 'vitest';
import { choiceText, commandText, hubStatusText, noteText, rollPartText } from '../src/ui/strings';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Feed } from '../src/ui/components/Feed';
import { SheetPanel } from '../src/ui/components/SheetPanel';
import type { LedgerNote } from '../src/bridge/types';
import { GameSession } from '../src/bridge/session';
import { data } from '../src/data';
import ink from '../src/story/main.ink';

describe('hub and command strings', () => {
  it('renders roll controls, both Edge actions and unchanged ink hints', () => {
    expect((['try', 'odds', 'back', 'accept'] as const).map(code => commandText({ code }).text)).toEqual([
      'Try it',
      'Odds',
      'Back',
      'Accept the result',
    ]);
    expect(commandText({ code: 'edge', reroll: true, left: 3 })).toEqual({
      text: 'Spend Edge: re-roll',
      sub: '3 left',
    });
    expect(commandText({ code: 'edge', reroll: false, left: 1 })).toEqual({
      text: 'Spend Edge: make it clean',
      sub: '1 left',
    });
    expect(choiceText({ id: 0, kind: 'choice', text: 'Story choice', sub: 'Story hint' })).toEqual({
      text: 'Story choice',
      sub: 'Story hint',
    });
    expect(rollPartText({ label: 'SOC', n: -1 })).toBe('SOC -1');
    expect(rollPartText({ label: 'Priya', n: 2, assist: { crewId: 'priya', name: 'Priya' } })).toBe('Priya assist +2');
  });

  it('renders structured upkeep and old plain notes in feed, summary and ledger', () => {
    const notes: LedgerNote[] = [
      { kind: 'cost', t: '', command: { code: 'cycleUpkeep', amount: 4000 } },
      { kind: 'watch', t: 'Saved <plain> note' },
    ];
    expect(notes.map(noteText)).toEqual(['Cycle upkeep paid: Cr4000.', 'Saved <plain> note']);
    const feed = renderToStaticMarkup(
      createElement(Feed, {
        events: [
          { id: 1, type: 'note', ...notes[0]! },
          { id: 2, type: 'summary', items: notes },
        ],
      }),
    );
    expect(feed.match(/Cycle upkeep paid: Cr4000\./g)).toHaveLength(2);
    const sheet = renderToStaticMarkup(createElement(SheetPanel, { ledger: notes, onClose: () => {} }));
    expect(sheet).toContain('Cycle upkeep paid: Cr4000.');
    for (const html of [feed, sheet]) expect(html).toContain('Saved &lt;plain&gt; note');
  });

  it('pluralises actions left', () => {
    expect(hubStatusText({ cycle: 1, actionsLeft: 1, board: 'ready' })).toContain('1 action left');
    expect(hubStatusText({ cycle: 1, actionsLeft: 2, board: 'ready' })).toContain('2 actions left');
    expect(hubStatusText({ cycle: 1, actionsLeft: 0, board: 'actions-spent' })).toContain('0 actions left');
  });

  it('writes the end-cycle and cancel hints from codes', () => {
    expect(commandText({ code: 'endCycle', actionsLeft: 1, noEligibleOffers: true }).sub).toBe(
      '1 action left. Pay ship upkeep and advance Pursuit. No eligible offers.',
    );
    expect(commandText({ code: 'cancel', ready: false }).sub).toBe(
      'Not ready: complete the required assignments and ensure you can pay the cost.',
    );
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

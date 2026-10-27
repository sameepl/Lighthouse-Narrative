import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { GameView, Offer } from '../src/bridge/types';
import { Board } from '../src/ui/components/Board';

const cycle: GameView['cycle'] = {
  cycle: 7,
  actionsLeft: 1,
  pursuit: { value: 2, length: 6 },
  edgeEarnedCrewIds: [],
};
const encounter: Offer = {
  kind: 'encounter',
  forced: false,
  weak: false,
  entry: {
    id: 'work',
    knot: 'work',
    title: 'Dock & charter',
    layer: 'commercial',
    archetype: 'standoff',
    tags: [],
    requires: {},
    repeat: { kind: 'once' },
    weight: 1,
    cost: 0,
    risk: 'A strained charter.',
  },
};
const keystone: Offer = {
  kind: 'keystone',
  forced: true,
  weak: true,
  entry: {
    id: 'turn',
    knot: 'turn',
    title: 'A turning point',
    elevates: 'standoff',
    availableWhen: { cycle: 7 },
    deadline: 8,
    piece: 'none',
    requires: {},
  },
};
const render = (offers: Offer[], offerLocks: GameView['offerLocks'] = []) =>
  renderToStaticMarkup(createElement(Board, { offers, offerLocks, cycle, onAct: () => {} }));

describe('Board projection rendering', () => {
  it('renders exactly the projected offers with cycle, layer, cost and risk', () => {
    const html = render([encounter, { ...encounter, entry: { ...encounter.entry, id: 'crisis', layer: 'crisis' } }]);
    expect(html.match(/<button\b/g)).toHaveLength(2);
    for (const text of [
      'Cycle 7',
      '1 action left',
      'Commercial',
      'Crisis',
      'Dock &amp; charter',
      'Cost Cr0',
      'A strained charter.',
    ])
      expect(html).toContain(text);
    expect(render([])).not.toContain('<button');
  });

  it('uses projected locks even when price differs and leaves preparation selectable', () => {
    const html = render(
      [encounter],
      [{ offerId: 'work', reasons: [{ code: 'insufficientCredits', required: 23, available: 2 }] }],
    );
    expect(html).toContain('Requires Cr23; Cr2 available.');
    expect(html).toContain('Select to prepare. You need enough Credits to begin.');
    expect(html).not.toContain('disabled');
    expect(render([encounter], [{ offerId: 'other', reasons: [{ code: 'noActionsLeft' }] }])).not.toContain(
      'board-lock',
    );
  });

  it('shows keystone flags without assigning it an encounter layer, price or risk', () => {
    const html = render([keystone]);
    for (const text of ['Keystone', 'Forced', 'Weaker options', 'Cost not listed', 'Risk not listed'])
      expect(html).toContain(text);
    for (const text of ['Crisis', 'Commercial', 'Cost Cr']) expect(html).not.toContain(text);
  });
});

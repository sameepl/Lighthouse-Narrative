import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import type { GameEvent, UIChoice } from '../src/bridge/types';
import { Feed, EventView } from '../src/ui/components/Feed';
import { Dock } from '../src/ui/components/Dock';

const roll: Extract<GameEvent, { type: 'roll' }> = {
  id: 1,
  type: 'roll',
  dice: [2, 3],
  mod: 1,
  total: 6,
  grade: 'fail',
  label: 'Failure',
};
it('distinguishes reroll and upgrade buttons and explains accepting without spending', () => {
  const render = (reroll: boolean) =>
    renderToStaticMarkup(
      createElement(Dock, {
        choices: [
          { id: 'edge', kind: 'edge', text: '', command: { code: 'edge', reroll, left: 2 } },
          { id: 'accept', kind: 'accept', text: '', command: { code: 'accept' } },
        ] satisfies UIChoice[],
        odds: null,
        ended: false,
        onAct: () => {},
        onRestart: () => {},
      }),
    );
  expect(render(true)).toContain('Reroll failed check (1 Edge)');
  expect(render(true)).toContain('even if it fails again');
  expect(render(false)).toContain('Upgrade to clean success (1 Edge)');
  expect(render(false)).toContain('Keep these dice; no new roll');
  expect(render(true)).toContain('Keep this outcome without spending Edge');
});
it('keeps original and rerolled dice and outcomes visible, including another failure', () => {
  const html = renderToStaticMarkup(
    createElement(Feed, {
      events: [
        roll,
        {
          ...roll,
          id: 2,
          dice: [1, 2],
          total: 4,
          edge: 'Edge spent: re-rolled',
        },
      ],
    }),
  );
  for (const text of ['Original roll', 'Rerolled result (1 Edge spent)', '2 + 3', '1 + 2', '<b>6</b>', '<b>4</b>'])
    expect(html).toContain(text);
  expect(html.match(/<b>Failure<\/b>/g)).toHaveLength(2);
});
it('shows an upgrade immediately with the unchanged dice, even for a fresh event', () => {
  const html = renderToStaticMarkup(
    createElement(EventView, {
      ev: { ...roll, grade: 'clean', label: 'Clean success', edge: 'Edge spent: upgraded' },
      delay: 0,
      fresh: true,
    }),
  );
  expect(html).toContain('Upgraded to clean success (1 Edge spent; no new roll)');
  expect(html).toContain('2 + 3'); // Fresh tumbling dice would start at 1 + 1.
  expect(html).toContain('<b>6</b>');
  expect(html).toContain('<b>Clean success</b>');
});

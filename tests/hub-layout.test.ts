import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Feed } from '../src/ui/components/Feed';

it('collapses only an empty Feed and retains the reading layout for restored story text', () => {
  expect(renderToStaticMarkup(createElement(Feed, { events: [] }))).toContain('class="feed-empty"');
  const html = renderToStaticMarkup(
    createElement(Feed, {
      events: [{ id: 1, type: 'para', html: 'Restored story', speech: false }],
    }),
  );
  expect(html).not.toContain('feed-empty');
  expect(html).toContain('data-ev="1"');
  expect(html).toContain('Restored story');
});

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { GameSession } from '../src/bridge/session';
import inkJson from '../src/story/main.ink';
import { data } from '../src/data';
import { Ending } from '../src/ui/components/Ending';

it('distinguishes the two K5 endings from foreclosure without replacing Ink prose', () => {
  const s = new GameSession({ data, inkJson });
  const base = s.store.getState();
  for (const [bg, failed, title] of [
    ['end_open', false, 'Request withdrawn'],
    ['end_closed', false, 'Request kept on file'],
    ['end_closed', true, 'Foreclosure'],
  ] as const) {
    const view = { ...base, ended: true, bg, cycle: { ...base.cycle, failed } };
    const before = structuredClone(view);
    const html = renderToStaticMarkup(createElement(Ending, { view, onRestart() {} }));
    expect(html).toContain(title);
    expect(html).toContain('aria-labelledby="ending-title"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('Play again');
    expect(html).toContain('No evidence pieces held.');
    expect(view).toEqual(before);
  }
});

it('lists each ledger entry once, preserves mixed costs, and escapes text', () => {
  const s = new GameSession({ data, inkJson });
  const view = s.store.getState();
  view.ledger = [
    { kind: 'gain', t: 'Cargo payment received.' },
    { kind: 'cost', t: 'Credits +500, Strain +1.' },
    { kind: 'watch', t: '<script>untrusted</script>' },
  ];
  view.evidence = [{ id: 'six', variant: 'header' }];
  const html = renderToStaticMarkup(
    createElement(Ending, {
      view,
      onRestart() {},
    }),
  );
  expect(html.match(/Cargo payment received/g)).toHaveLength(1);
  expect(html.match(/Credits \+500, Strain \+1/g)).toHaveLength(1);
  expect(html).toContain('Other consequences (1)');
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>');
  expect(html).toContain('Manifest fragment (header only; entries missing)');
});

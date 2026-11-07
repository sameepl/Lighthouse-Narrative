import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { Title } from '../src/ui/components/Title';
import { hintSeen, markHintSeen } from '../src/ui/onboarding';

afterEach(() => vi.unstubAllGlobals());
it('offers Continue only for a usable save and explains replacement', () => {
  const render = (canContinue: boolean) =>
    renderToStaticMarkup(
      createElement(Title, {
        canContinue,
        onStart: () => {},
        onContinue: () => {},
        onTheme: () => {},
      }),
    );
  expect(render(false)).toContain('>Start</button>');
  expect(render(false)).not.toContain('>Continue</button>');
  expect(render(true)).toContain('>Continue</button>');
  expect(render(true)).toContain('>New run</button>');
  expect(render(true)).toContain('replaces the saved run');
  expect(render(false)).toContain('https://github.com/sameepl/Lighthouse-Narrative/issues/new');
});
it('retains seen hints across module reloads independently of the run save', async () => {
  const values = new Map([['lighthouse-narrative-save-v4', 'untouched']]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  expect(hintSeen('board')).toBe(false);
  markHintSeen('board');
  expect(hintSeen('board')).toBe(true);
  expect(hintSeen('prepare')).toBe(false);
  vi.resetModules();
  const reloaded = await import('../src/ui/onboarding');
  expect(reloaded.hintSeen('board')).toBe(true);
  expect(reloaded.hintSeen('prepare')).toBe(false);
  expect(values.get('lighthouse-narrative-save-v4')).toBe('untouched');
});

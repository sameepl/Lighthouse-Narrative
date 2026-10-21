import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

interface Guard {
  paths: string[];
  terms: { pattern: string; why: string }[];
  allowed: { pattern: string; file: string; reason: string }[];
}

const guard = JSON.parse(readFileSync('.github/canon-guard.json', 'utf8')) as Guard;
const textExtensions = new Set(['.ink', '.json', '.ts', '.tsx', '.css', '.html', '.svg']);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return textExtensions.has(extname(path)) ? [path] : [];
  });
}

/** Returns "file: term" for every GM-only term found in the given player-visible files. */
export function findLeaks(sources: { file: string; text: string }[], config: Guard = guard): string[] {
  return sources.flatMap(({ file, text }) =>
    config.terms
      .filter(term => new RegExp(term.pattern, 'i').test(text))
      .filter(term => !config.allowed.some(a => a.pattern === term.pattern && a.file === file))
      .map(term => `${file}: /${term.pattern}/ (${term.why})`),
  );
}

describe('canon guard', () => {
  it('keeps GM-only and HELD terms out of player-visible files', () => {
    const sources = guard.paths.flatMap(files).map(file => ({ file, text: readFileSync(file, 'utf8') }));
    expect(sources.length).toBeGreaterThan(0);
    expect(findLeaks(sources)).toEqual([]);
  });

  it('catches a planted term, and respects an allow entry', () => {
    const planted = [{ file: 'src/story/scenes/x.ink', text: 'The drone lists EID-0 as supervisory authority.' }];
    expect(findLeaks(planted)).toHaveLength(1);
    const allowed = { ...guard, allowed: [{ pattern: 'EID-0', file: 'src/story/scenes/x.ink', reason: 'test' }] };
    expect(findLeaks(planted, allowed)).toEqual([]);
  });

  it('gives every term a reason', () => {
    for (const term of guard.terms) expect(term.why.length).toBeGreaterThan(0);
  });
});

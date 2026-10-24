import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkZones, globToRegExp, resolveZone, type ZoneConfig } from '../scripts/zone-check.mjs';

const config = JSON.parse(readFileSync('.github/zones.json', 'utf8')) as ZoneConfig;
const zoneOf = (input: { labels?: string[]; branch?: string }) => resolveZone(input, config);

describe('globs', () => {
  it('** crosses folders, * does not', () => {
    expect(globToRegExp('docs/**').test('docs/a/b.md')).toBe(true);
    expect(globToRegExp('src/*.ts').test('src/a.ts')).toBe(true);
    expect(globToRegExp('src/*.ts').test('src/a/b.ts')).toBe(false);
    expect(globToRegExp('a.json').test('aXjson')).toBe(false);
  });
});

describe('resolving a zone', () => {
  it('prefers a zone label, then a branch prefix', () => {
    expect(zoneOf({ labels: ['zone:content'], branch: 'codex/x' })).toEqual({ zone: 'content' });
    expect(zoneOf({ labels: [], branch: 'feature/board-ui' })).toEqual({ zone: 'feature' });
  });
  it('rejects undeclared and ambiguous zones', () => {
    expect(zoneOf({ labels: [], branch: 'codex/random' })).toHaveProperty('error');
    expect(zoneOf({ labels: ['zone:core', 'zone:docs'], branch: 'x' })).toHaveProperty('error');
    expect(zoneOf({ labels: ['bug'], branch: 'main' })).toHaveProperty('error');
  });
});

describe('checking files', () => {
  it('lets content agents touch scenes and data, but not code or contracts', () => {
    expect(
      checkZones({ zone: 'content', files: ['src/story/scenes/enc_trade.ink', 'src/data/crew.json'] }, config).ok,
    ).toBe(true);
    const bad = checkZones(
      { zone: 'content', files: ['src/story/scenes/a.ink', 'src/engine/rules.ts', 'src/story/lib/roll.ink'] },
      config,
    );
    expect(bad.violations).toEqual(['src/engine/rules.ts', 'src/story/lib/roll.ink']);
  });
  it('lets content activate season data while keeping all code contracts protected', () => {
    expect(
      checkZones({ zone: 'content', files: ['src/data/season.json', 'src/data/keystones/opening.json'] }, config).ok,
    ).toBe(true);
    const contracts = ['src/data/schema.ts', 'src/data/validate.ts', 'src/data/index.ts', 'src/bridge/run.ts'];
    for (const zone of ['content', 'feature'])
      expect(checkZones({ zone, files: contracts }, config).violations).toEqual(contracts);
  });
  it('lets feature agents add engine and UI files but not edit contract files or the bridge', () => {
    expect(
      checkZones(
        { zone: 'feature', files: ['src/ui/components/Board.tsx', 'src/engine/board.ts', 'tests/board.test.ts'] },
        config,
      ).ok,
    ).toBe(true);
    expect(
      checkZones({ zone: 'feature', files: ['src/engine/types.ts', 'src/bridge/session.ts', 'package.json'] }, config)
        .violations,
    ).toHaveLength(3);
  });
  it('keeps docs agents out of decisions and code', () => {
    expect(checkZones({ zone: 'docs', files: ['docs/ROADMAP.md', 'README.md'] }, config).ok).toBe(true);
    expect(
      checkZones({ zone: 'docs', files: ['docs/decisions/0001-stack.md', 'src/main.tsx'] }, config).violations,
    ).toHaveLength(2);
  });
  it('core may touch anything', () => {
    expect(checkZones({ zone: 'core', files: ['package.json', 'src/engine/types.ts'] }, config).ok).toBe(true);
  });
  it('fails on an unknown zone', () => {
    expect(checkZones({ zone: 'nope', files: [] }, config).ok).toBe(false);
  });
});

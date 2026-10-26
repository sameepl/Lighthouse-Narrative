import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { lintRoster, lintDirectory, parseScene, type Scene } from '../scripts/content-lint.mjs';
import { lintScene } from '../scripts/content-gates.mjs';

// Synthetic prose deliberately varies sentence beginnings, objects and actors.
const actors = ['Amber', 'Beryl', 'Coral', 'Dahlia', 'Ember', 'Flint', 'Garnet', 'Hazel', 'Indigo', 'Jasper'];
function fixture(): Scene {
  const passage = (i: number) => ({
    name: `stub_fixture__a${Math.floor((i - 1) / 3) + 1}_${['clean', 'cost', 'fail'][(i - 1) % 3]}`,
    text: `[STUB] ${actors[i]} watches distant machinery carry a battered metal cylinder toward several waiting workers beside silent equipment. Nearby cranes lift heavy containers above weathered walkways before lunch while pale lamps illuminate empty corridors. Outside ships drift. Beyond glass stars gleam against deep darkness tonight.`,
    effects: [['Credits', i % 3 === 1 ? 1500 : -500]] as [string, number][],
    notes: [`[STUB] Credits ${i % 3 === 1 ? '+1,500' : '-500'}`],
    grade: ['clean', 'cost', 'fail'][(i - 1) % 3],
  });
  const scene: Scene = {
    id: 'stub_fixture',
    location: 'docs/canon/locations/the-shoal.md',
    encounter: { id: 'stub_fixture', knot: 'stub_fixture_scene', archetype: 'scout', layer: 'commercial' },
    open: passage(0),
    outcomes: Array.from({ length: 9 }, (_, i) => passage(i + 1)),
    ending: {
      name: 'stub_fixture__after',
      text: '[STUB] Here at the Shoal, the ledger card follows.',
      effects: [],
      notes: [],
    },
  };
  // Rotate all sentence openers, not just the first sentence.
  [scene.open, ...scene.outcomes].forEach((p, i) => {
    p.text = p.text
      .replace('a battered metal cylinder', actors[i] + ' metalwork')
      .replace('Nearby cranes', `${actors[i]} cranes`)
      .replace('Outside ships', `${actors[i]} ships`)
      .replace('Beyond glass', `${actors[i]} glass`);
  });
  return scene;
}
function ink(s = fixture()) {
  const id = s.id;
  return (
    '// @content ' +
    JSON.stringify({ id, location: s.location }) +
    '\n' +
    '=== ' +
    s.encounter.knot +
    ' ===\n' +
    s.open.text +
    '\n-> ' +
    id +
    '__menu\n' +
    '=== ' +
    id +
    '__menu ===\n' +
    ['a1', 'a2', 'a3']
      .map(
        g =>
          '+ [Inspect the marker #hint:Recon / Electronics]\n-> roll("Recon,Electronics", 8, "", ' +
          ['clean', 'cost', 'fail'].map(grade => '-> ' + id + '__' + g + '_' + grade).join(', ') +
          ')',
      )
      .join('\n') +
    '\n' +
    s.outcomes
      .map(
        p =>
          '=== ' +
          p.name +
          ' ===\n' +
          p.text +
          '\n' +
          p.effects.map(([r, n]) => '~ add("' + r + '", ' + n + ')').join('\n') +
          '\n' +
          p.notes.map(n => '~ note("cost", ' + JSON.stringify(n) + ')').join('\n') +
          '\n-> ' +
          id +
          '__after\n',
      )
      .join('\n') +
    '=== ' +
    id +
    '__after ===\n' +
    s.ending.text +
    ' # summary\n-> scene_end\n'
  );
}
describe('Ink parser and metadata association', () => {
  it('parses passages, effects and escaped note strings', () => {
    const s = fixture();
    const parsed = parseScene(ink(s), s.encounter);
    expect(lintScene(parsed)).toEqual([]);
    expect(parsed.outcomes[0]!.effects).toEqual([['Credits', 1500]]);
  });
  it.each([
    (text: string) => text + '\n=== rogue ===\n~ add("Credits", 1500)',
    (text: string) => '~ add("Credits", 1500)\n' + text,
    (text: string) => text.replace('-> scene_end', '~ add("Credits", 1500)\n-> scene_end'),
    (text: string) => text.replace('-> stub_fixture__menu', '~ note("gain", "Credits +1500")\n-> stub_fixture__menu'),
    (text: string) => text.replaceAll('stub_fixture__a1_cost', 'stub_fixture__orphan_cost'),
    (text: string) => text.replace('~ add("Credits", 1500)', '~ hidden = true'),
    (text: string) => text.replace('"location":"docs/canon/locations/the-shoal.md"', '"location":42'),
    (text: string) => text.replace('// @content', '// ignored'),
    (text: string) => text.replace('docs/canon/locations/the-shoal.md', '../canon-gm/secret.md'),
    (text: string) => text.replace('"id":"stub_fixture"', '"id":"../escape"'),
    (text: string) => text.replace('~ add("Credits", 1500)', '~ add("Credits", 1 + 1499)'),
    (text: string) => text.replace('~ add("Credits", 1500)', '~ trust("crew", 1)'),
    (text: string) => text.replace('=== stub_fixture__a1_clean ===', '=== missing ==='),
  ])('refuses missing/unsafe metadata and unsupported control forms', change =>
    expect(() => parseScene(change(ink()), fixture().encounter)).toThrow(),
  );
  it('requires the encounter id and entry knot to match', () =>
    expect(() => parseScene(ink(), { ...fixture().encounter, id: 'other' })).toThrow());
});

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
function repository() {
  const root = mkdtempSync(path.join(tmpdir(), 'content-lint-'));
  roots.push(root);
  for (const dir of ['src/story/scenes', 'src/data/encounters', 'docs/canon/locations'])
    mkdirSync(path.join(root, dir), { recursive: true });
  writeFileSync(path.join(root, 'docs/canon/locations/the-shoal.md'), 'Public location placeholder.');
  writeFileSync(path.join(root, 'src/story/scenes/stub_fixture.ink'), ink());
  writeFileSync(path.join(root, 'src/data/encounters/stub_fixture.json'), JSON.stringify(fixture().encounter));
  return root;
}
it('runs the CLI against a roster and reports malformed associations with a failing exit', () => {
  const root = repository(),
    script = path.resolve('scripts/content-lint.mjs');
  expect(spawnSync(process.execPath, [script, root], { encoding: 'utf8' }).status).toBe(0);
  writeFileSync(path.join(root, 'src/data/encounters/stub_fixture.json'), '{}');
  const failed = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
  expect(failed.status).toBe(1);
  expect(failed.stderr).toContain('association');
});

it('accepts the existing named approach convention', () => {
  const text = ink()
    .replaceAll('__a1_', '__parley_')
    .replaceAll('__a2_', '__coordinate_')
    .replaceAll('__a3_', '__inspect_');
  expect(lintScene(parseScene(text, fixture().encounter))).toEqual([]);
});
it.each([undefined, 42, null])('rejects invalid encounter knot type %s', knot =>
  expect(() => parseScene(ink(), { ...fixture().encounter, knot } as unknown as Scene['encounter'])).toThrow(),
);
it('checks duplicate roster locations', () =>
  expect(
    lintRoster([parseScene(ink(), fixture().encounter), parseScene(ink(), fixture().encounter)]).join('\n'),
  ).toContain('location: duplicate'));

it('reports an orphan stub encounter', () => {
  const root = repository();
  writeFileSync(
    path.join(root, 'src/data/encounters/stub_orphan.json'),
    JSON.stringify({ ...fixture().encounter, id: 'stub_orphan' }),
  );
  expect(lintDirectory(root).join('\n')).toContain('orphan stub encounter');
});
it('rejects symlink directory components before reading content', context => {
  const root = repository(),
    source = path.join(root, 'src/story/scenes'),
    moved = path.join(root, 'actual-scenes');
  renameSync(source, moved);
  try {
    symlinkSync(moved, source, 'junction');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EPERM') {
      context.skip('Host denies symlink creation');
      return;
    }
    throw error;
  }
  expect(() => lintDirectory(root)).toThrow('Symlink');
});
it('rejects location path traversal without reading it', () => {
  const root = repository();
  writeFileSync(
    path.join(root, 'src/story/scenes/stub_fixture.ink'),
    ink().replace('docs/canon/locations/the-shoal.md', 'docs/canon-gm/private.md'),
  );
  expect(lintDirectory(root).join('\n')).toContain('Invalid location namespace');
});

it('checks nonstub encounter JSON independently of stub Ink metadata', () => {
  const root = repository(),
    file = path.join(root, 'src/data/encounters/regular_courier.json'),
    script = path.resolve('scripts/content-lint.mjs');
  const entry = {
    ...fixture().encounter,
    id: 'regular_courier',
    knot: 'regular_courier_scene',
    archetype: 'courier',
    layer: 'commercial',
  };
  writeFileSync(file, JSON.stringify(entry));
  expect(lintDirectory(root)).toEqual([]);
  writeFileSync(file, JSON.stringify({ ...entry, layer: 'crisis' }));
  expect(lintDirectory(root).join('\n')).toContain('Encounter archetype/layer mismatch');
  expect(spawnSync(process.execPath, [script, root], { encoding: 'utf8' }).status).toBe(1);
  writeFileSync(file, JSON.stringify({ ...entry, id: 'wrong_id' }));
  expect(lintDirectory(root).join('\n')).toContain('filename/id');
  writeFileSync(file, '{');
  expect(lintDirectory(root).join('\n')).toContain('catalog:');
});

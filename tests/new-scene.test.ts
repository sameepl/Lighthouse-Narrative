import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { compileInk } from '../plugins/vite-plugin-ink';
import { Story } from 'inkjs';
import { data } from '../src/data';
import { parseContent } from '../src/data/validate';

const script = path.resolve('scripts/new-scene.mjs');
const dirs: string[] = [];
const workspace = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'new-scene-'));
  dirs.push(root);
  return root;
};
const cli = (root: string, args: string[]) =>
  spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
const args = (id: string, archetype = 'courier', layer = 'commercial') => [
  '--id',
  id,
  '--archetype',
  archetype,
  '--layer',
  layer,
];
const files = (root: string, id: string) => [
  path.join(root, 'src/story/scenes', `${id}.ink`),
  path.join(root, 'src/data/encounters', `${id}.json`),
];
afterEach(() => {
  for (const root of dirs.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('new:scene CLI', () => {
  it.each(['trade_run', 'courier', 'salvage', 'scout', 'distress_call', 'standoff'])(
    'generates valid %s metadata and walks every approach/outcome untouched',
    archetype => {
      const root = workspace();
      expect(cli(root, args('menu', archetype)).status).toBe(0);
      expect(cli(root, args('menu_scene', archetype, 'crisis')).status).toBe(0);
      const generated = ['menu', 'menu_scene'].map(id => {
        const [scene, json] = files(root, id) as [string, string];
        return { scene: readFileSync(scene, 'utf8'), json: JSON.parse(readFileSync(json, 'utf8')), file: json };
      });
      // Compile alongside the real scene and bridge libraries, catching shared knot collisions.
      const source = ['src/story/lib/world.ink', 'src/story/lib/roll.ink', 'src/story/scenes/written_clause.ink']
        .map(file => readFileSync(file, 'utf8'))
        .join('\n');
      const main = path.join(root, 'main.ink');
      writeFileSync(main, `-> END\n${source}\n${generated.map(g => g.scene).join('\n')}`);
      const compiled = compileInk(main);
      const parsed = parseContent(
        {
          './encounters/written_clause.json': data.encounters.find(entry => entry.id === 'written_clause')!,
          ...Object.fromEntries(generated.map(g => [g.file, g.json])),
        },
        {},
        {
          shipTags: data.ships.flatMap(ship => ship.tags),
          crewIds: data.crew.map(crew => crew.id),
          knotExists: knot => {
            const story = new Story(compiled);
            story.ChoosePathString(knot);
            return true;
          },
        },
      );
      for (const entry of generated) {
        expect(parsed.encounters).toContainEqual(entry.json);
        expect(entry.json).toMatchObject({ archetype, placeholder: true, title: expect.stringContaining('[STUB]') });
        const outcomes = new Set<string>();
        for (let approach = 0; approach < 3; approach++)
          for (const grade of [0, 1, 2]) {
            const story = new Story(compiled);
            const notes: string[][] = [],
              text: string[] = [],
              tags: string[] = [],
              errors: string[] = [];
            story.onError = message => errors.push(message);
            story.BindExternalFunction('res', () => 0);
            story.BindExternalFunction('add', () => {});
            story.BindExternalFunction(
              'note',
              (kind, note) => {
                notes.push([kind, note]);
              },
              false,
            );
            const advance = () => {
              while (story.canContinue) {
                text.push(story.Continue() ?? '');
                tags.push(...(story.currentTags ?? []));
              }
            };
            story.ChoosePathString(entry.json.knot);
            advance();
            expect(story.currentChoices).toHaveLength(3);
            expect(story.currentChoices.every(choice => choice.tags?.some(tag => tag.startsWith('hint:')))).toBe(true);
            story.ChooseChoiceIndex(approach);
            advance();
            expect(story.currentChoices.map(choice => choice.text)).toEqual(['__check__']);
            for (const skill of String(story.variablesState.$('chk_skills')).split(','))
              expect(data.rules.skillChar).toHaveProperty(skill);
            expect(Number(story.variablesState.$('chk_target'))).toBeGreaterThan(0);
            story.variablesState.$('roll_grade', grade);
            story.ChooseChoiceIndex(0);
            advance();
            expect(story.currentChoices.map(choice => choice.text)).toEqual(['__scene_end__']);
            expect(tags).toContain('summary');
            expect(text.filter(line => line.trim()).every(line => line.includes('[STUB]'))).toBe(true);
            expect(notes).toEqual([[grade === 2 ? 'gain' : 'cost', expect.stringContaining('[STUB]')]]);
            outcomes.add(notes[0]![1]!);
            story.ChooseChoiceIndex(0);
            advance();
            expect(story.currentChoices).toEqual([]);
            expect(errors).toEqual([]);
          }
        expect(outcomes.size).toBe(9);
      }
    },
  );

  it.each([
    [],
    ['--id'],
    args('../escape'),
    args('..\\escape'),
    args('C:\\escape'),
    args('Upper'),
    args('bad__id'),
    args('bad_'),
    args('ok', 'unknown'),
    args('ok', 'courier', 'unknown'),
    [...args('ok'), '--id', 'other'],
    [...args('ok'), '--unknown', 'x'],
    ['--id', 'ok', '--layer', 'crisis'],
    ['--id', 'ok', '--archetype', 'courier'],
  ])('rejects invalid arguments without creating files: %j', (...invalid) => {
    const root = workspace();
    const result = cli(root, invalid);
    expect(result.status).toBe(1);
    expect(result.stderr).not.toBe('');
    expect(readdirSync(root)).toEqual([]);
  });

  it.each(['scene', 'metadata', 'both'])('refuses existing %s without changing either destination', existing => {
    const root = workspace(),
      destinations = files(root, 'example');
    for (const [index, file] of destinations.entries())
      if (existing === 'both' || index === (existing === 'scene' ? 0 : 1)) {
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, 'original');
      }
    const before = destinations.map(file => (existsSync(file) ? readFileSync(file, 'utf8') : null));
    expect(cli(root, args('example')).status).toBe(1);
    expect(destinations.map(file => (existsSync(file) ? readFileSync(file, 'utf8') : null))).toEqual(before);
  });

  it('removes its reserved scene if the metadata destination cannot be created', () => {
    const root = workspace();
    mkdirSync(path.join(root, 'src'));
    writeFileSync(path.join(root, 'src/data'), 'blocked parent');
    expect(cli(root, args('example')).status).toBe(1);
    expect(existsSync(files(root, 'example')[0]!)).toBe(false);
    expect(readFileSync(path.join(root, 'src/data'), 'utf8')).toBe('blocked parent');
  });
});

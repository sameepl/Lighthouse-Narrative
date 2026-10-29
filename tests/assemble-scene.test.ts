import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { afterEach, expect, it, vi } from 'vitest';
import { Story } from 'inkjs';
import { compileInk } from '../plugins/vite-plugin-ink';
import { EncounterSchema } from '../src/data/schema';
import { assembleScene } from '../scripts/assemble-scene.mjs';
import { lintDirectory } from '../scripts/content-lint.mjs';

const roots: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});
function fixture() {
  const root = fs.mkdtempSync(path.join(tmpdir(), 'assembler-'));
  roots.push(root);
  for (const dir of ['src/story/scenes', 'src/data/encounters', 'docs/canon/locations'])
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.copyFileSync('src/data/rules.json', path.join(root, 'src/data/rules.json'));
  fs.writeFileSync(path.join(root, 'docs/canon/locations/the-shoal.md'), 'Public fixture.');
  const actors = ['Amber', 'Beryl', 'Coral', 'Dahlia', 'Ember', 'Flint', 'Garnet', 'Hazel', 'Indigo', 'Jasper'];
  // Existing content-tools synthetic prose, with its sentence-opener rotation.
  const prose = (i: number) =>
    `[STUB] ${actors[i]} watches distant machinery carry ${actors[i]} metalwork toward several waiting workers beside silent equipment. ${actors[i]} cranes lift heavy containers above weathered walkways before lunch while pale lamps illuminate empty corridors. ${actors[i]} ships drift. ${actors[i]} glass stars gleam against deep darkness tonight.`;
  const approaches = ['Inspect the marker', 'Read the old instrument', 'Ask the waiting worker'].map(label => ({
    label,
    skills: ['Recon', 'Electronics'],
    npc_reaction: 'waits nearby',
    effects: { clean: [['Credits', 1500]], cost: [['Credits', -500]], fail: [['Strain', 1]] },
  }));
  const brief = {
    id: 'stub_fixture',
    archetype: 'scout',
    layer: 'commercial',
    location: 'docs/canon/locations/the-shoal.md',
    who: 'worker',
    want: 'Read marker',
    at_stake: 'Time passes',
    complication: 'A reading differs',
    approaches,
  };
  const writer = {
    open: prose(0),
    outcomes: Object.fromEntries(
      approaches.map((a, i) => [
        a.label,
        Object.fromEntries(
          ['clean', 'cost', 'fail'].map((g, j) => [
            g,
            { text: prose(i * 3 + j + 1), note: ['Credits +1,500', 'Credits -500', 'Strain +1'][j] },
          ]),
        ),
      ]),
    ),
    ending: '[STUB] Here at the Shoal, the ledger card follows.',
  };
  return { root, brief, writer };
}
const destinations = (root: string) =>
  ['src/story/scenes/stub_fixture.ink', 'src/data/encounters/stub_fixture.json'].map(p => path.join(root, p));
it.each(['Recon', 'Gun Combat'])('compiles real Ink with %s and walks all nine effect-exact branches', skill => {
  const { root, brief, writer } = fixture();
  brief.approaches[0]!.skills[0] = skill;
  writer.outcomes[brief.approaches[0]!.label]!.clean!.note = '[STUB] “Paid” "Credits +1,500"';
  const result = assembleScene(brief, writer, root);
  expect(EncounterSchema.safeParse(result.encounter).success).toBe(true);
  expect(result.encounter).not.toHaveProperty('location');
  expect(lintDirectory(root)).toEqual([]);
  const main = path.join(root, 'main.ink');
  fs.writeFileSync(
    main,
    '-> END\n' +
      ['src/story/lib/world.ink', 'src/story/lib/roll.ink'].map(f => fs.readFileSync(f, 'utf8')).join('\n') +
      '\n' +
      result.ink,
  );
  const compiled = compileInk(main);
  for (let a = 0; a < 3; a++)
    for (let grade = 0; grade < 3; grade++) {
      const story = new Story(compiled),
        effects: unknown[][] = [],
        notes: string[] = [],
        lines: string[] = [];
      story.BindExternalFunction('res', () => 0);
      story.BindExternalFunction('add', (r, n) => effects.push([r, n]));
      story.BindExternalFunction('note', (_k, text) => notes.push(String(text)), false);
      const advance = () => {
        while (story.canContinue) lines.push(story.Continue() ?? '');
      };
      story.ChoosePathString(result.encounter.knot);
      advance();
      expect(story.currentChoices).toHaveLength(3);
      expect(story.currentChoices.every(c => c.text.startsWith('[STUB]'))).toBe(true);
      story.ChooseChoiceIndex(a);
      advance();
      expect(story.variablesState.$('chk_skills')).toBe(brief.approaches[a]!.skills.join(','));
      story.variablesState.$('roll_grade', grade);
      story.ChooseChoiceIndex(0);
      advance();
      const g = ['fail', 'cost', 'clean'][grade] as 'clean' | 'cost' | 'fail';
      expect(effects).toEqual(brief.approaches[a]!.effects[g]);
      expect(notes).toEqual([
        '[STUB] ' + writer.outcomes[brief.approaches[a]!.label]![g]!.note!.replace(/^\[STUB\] /, ''),
      ]);
      expect(lines.filter(s => s.trim()).every(s => s.includes('[STUB]'))).toBe(true);
      expect(story.currentChoices.map(c => c.text)).toEqual(['__scene_end__']);
    }
});
it.each([null, [], {}, 42, { id: '../escape' }])('rejects unknown malformed brief %j', input => {
  const { root, writer } = fixture();
  expect(() => assembleScene(input, writer, root)).toThrow();
  expect(destinations(root).some(fs.existsSync)).toBe(false);
});
it.each([
  '\n~ add("Credits", 999)',
  '\\',
  '{x}',
  '|',
  '# tag',
  '-> scene_end',
  '\u0000',
  '[extra]',
  '/* comment */',
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '\n',
  '\u2028',
])('rejects writer control %j before writes', bad => {
  const { root, brief, writer } = fixture();
  writer.open += bad;
  expect(() => assembleScene(brief, writer, root)).toThrow();
  expect(destinations(root).some(fs.existsSync)).toBe(false);
});
it('rejects extra writer keys, labels, grades, duplicate approaches, unknown skills and mismatched notes', () => {
  const cases = [
    (b: any, w: any) => {
      w.effects = [];
    },
    (b: any, w: any) => {
      w.outcomes.rogue = w.outcomes[b.approaches[0].label];
    },
    (b: any, w: any) => {
      delete w.outcomes[b.approaches[0].label].fail;
    },
    (b: any) => {
      b.approaches[1].label = b.approaches[0].label;
    },
    (b: any) => {
      b.approaches[0].label = 'Ask a passing salvage crew which beacon they avoid';
    },
    (b: any) => {
      b.approaches[0].skills[0] = 'Invented';
    },
    (b: any) => {
      b.approaches[0].skills[0] = 'Gun Combat\", -> scene_end';
    },
    (b: any, w: any) => {
      w.outcomes[b.approaches[0].label].clean.note = 'Credits +999';
    },
    (b: any) => {
      b.approaches[0].effects.clean = [['Credits', 999]];
    },
    (b: any) => {
      b.location = 'docs/canon-gm/private.md';
    },
    (b: any) => {
      b.id = 'target_reference';
    },
  ];
  for (const change of cases) {
    const { root, brief, writer } = fixture();
    change(brief, writer);
    expect(() => assembleScene(brief, writer, root)).toThrow();
    expect(destinations(root).some(fs.existsSync)).toBe(false);
  }
});
it('accepts ordinary quotes in notes and curly dialogue, preserving deterministic marker', () => {
  const { root, brief, writer } = fixture();
  writer.outcomes[brief.approaches[0]!.label]!.clean!.note = '[STUB] “Paid” "Credits +1,500"';
  const result = assembleScene(brief, writer, root);
  expect(result.ink).toContain('\\"Credits +1,500\\"');
  expect(result.ink).not.toContain('[STUB] [STUB]');
});
it('checks existing roster and rejects duplicate location without writes', () => {
  const { root, brief, writer } = fixture();
  assembleScene(brief, writer, root);
  expect(() => assembleScene({ ...brief, id: 'stub_other' }, writer, root)).toThrow('duplicate');
  expect(fs.readdirSync(path.join(root, 'src/story/scenes'))).toEqual(['stub_fixture.ink']);
});
it('refuses symlink output and location parents', context => {
  for (const relative of ['src/story/scenes', 'docs/canon/locations']) {
    const { root, brief, writer } = fixture(),
      original = path.join(root, relative),
      moved = original + '-real';
    fs.renameSync(original, moved);
    try {
      fs.symlinkSync(moved, original, 'junction');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EPERM') {
        context.skip('Host denies junction creation; CI exercises this check');
        return;
      }
      throw error;
    }
    expect(() => assembleScene(brief, writer, root)).toThrow('Symlink');
  }
});
it('refuses an existing scene without changing it', () => {
  const { root, brief, writer } = fixture();
  fs.writeFileSync(destinations(root)[0]!, 'original');
  expect(() => assembleScene(brief, writer, root)).toThrow();
  expect(fs.readFileSync(destinations(root)[0]!, 'utf8')).toBe('original');
});
it('rolls back its first reservation after second EEXIST while preserving the existing file', () => {
  const { root, brief, writer } = fixture(),
    files = destinations(root),
    original = fs.openSync;
  vi.spyOn(fs, 'openSync').mockImplementation(((file: fs.PathLike, flags: string, mode?: number) => {
    if (String(file) === files[1] && flags === 'wx') fs.writeFileSync(file, 'existing');
    return original(file, flags, mode);
  }) as typeof fs.openSync);
  expect(() => assembleScene(brief, writer, root)).toThrow();
  expect(fs.existsSync(files[0]!)).toBe(false);
  expect(fs.readFileSync(files[1]!, 'utf8')).toBe('existing');
});
it('rolls back both owned files after second write failure', () => {
  const { root, brief, writer } = fixture(),
    original = fs.writeFileSync;
  let writes = 0;
  vi.spyOn(fs, 'writeFileSync').mockImplementation(((...args: Parameters<typeof fs.writeFileSync>) => {
    if (typeof args[0] === 'number' && ++writes === 2) throw new Error('second write fault');
    return original(...args);
  }) as typeof fs.writeFileSync);
  expect(() => assembleScene(brief, writer, root)).toThrow('second write fault');
  expect(destinations(root).some(fs.existsSync)).toBe(false);
});
it('CLI accepts JSON files and rejects missing, duplicate, unknown arguments or malformed JSON', () => {
  const { root, brief, writer } = fixture(),
    script = path.resolve('scripts/assemble-scene.mjs');
  const b = path.join(root, 'brief.json'),
    w = path.join(root, 'writer.json');
  fs.writeFileSync(b, JSON.stringify(brief));
  fs.writeFileSync(w, JSON.stringify(writer));
  const run = (args: string[]) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  for (const args of [[], ['--brief'], ['--what', b], ['--brief', b, '--brief', b]]) expect(run(args).status).toBe(1);
  const args = ['--brief', b, '--passages', w, '--root', root];
  expect(run(args).status).toBe(0);
  fs.writeFileSync(w, '{bad');
  expect(run(args).status).toBe(1);
});

function v2(brief: ReturnType<typeof fixture>['brief']) {
  return {
    ...brief,
    places: ["the Exchange clerk's desk"],
    state_nouns: ['citation'],
    sensory_details_used: { sound: 'COORDINATOR_ONLY' },
    effect_reasons: Object.fromEntries(
      brief.approaches.map(a => [
        a.label,
        {
          clean: 'the stallholder refunds your crew the second charge',
          cost: 'the clerk bills your crew a filing fee',
          fail: 'the argument leaves your crew exhausted',
        },
      ]),
    ),
  };
}
it('accepts v2 coordinator metadata without publishing it', () => {
  const { root, brief, writer } = fixture();
  const result = assembleScene(v2(brief), writer, root);
  for (const field of [
    'places',
    'effect_reasons',
    'sensory_details_used',
    'COORDINATOR_ONLY',
    "the Exchange clerk's desk",
    'stallholder refunds',
  ])
    expect(result.ink + JSON.stringify(result.encounter)).not.toContain(field);
});
it.each([
  (b: any) => {
    b.places = [42];
  },
  (b: any) => {
    b.effect_reasons = {};
  },
  (b: any) => {
    b.approaches[1].label = b.approaches[0].label;
  },
  (b: any) => {
    b.effect_reasons[b.approaches[0].label].clean = '';
  },
  (b: any) => {
    b.effect_reasons.unknown = b.effect_reasons[b.approaches[0].label];
  },
  (b: any) => {
    delete b.effect_reasons[b.approaches[0].label].fail;
  },
])('rejects invalid v2 metadata before creating outputs', change => {
  const { root, brief, writer } = fixture(),
    b = v2(brief);
  change(b);
  expect(() => assembleScene(b, writer, root)).toThrow();
  expect(destinations(root).some(fs.existsSync)).toBe(false);
});
it('rejects duplicate labels in the prompt CLI without assembler fallback', () => {
  const { root, brief } = fixture(),
    b = v2(brief);
  b.approaches[1]!.label = b.approaches[0]!.label;
  const file = path.join(root, 'brief.json');
  fs.writeFileSync(file, JSON.stringify(b));
  const failed = spawnSync(
    process.execPath,
    [path.resolve('scripts/build-prompt.mjs'), '--brief', file, '--root', root],
    { encoding: 'utf8' },
  );
  expect(failed.status).toBe(1);
  expect(failed.stderr).toContain('distinct approach labels');
});

it('builds a deterministic writer prompt containing only the brief, named location and contract sections 3/4/5/7', () => {
  const { root, brief } = fixture(),
    b = path.join(root, 'brief.json');
  fs.writeFileSync(b, JSON.stringify(v2(brief)));
  fs.writeFileSync(
    path.join(root, 'docs/CONTENT_GENERATION.md'),
    Array.from(
      { length: 9 },
      (_, i) =>
        `## ${i + 1}. Section\nContract text ${i + 1}.${i === 6 ? '\n## Coordinator notes\nPRIVATE_METADATA' : ''}`,
    ).join('\n'),
  );
  fs.writeFileSync(path.join(root, 'docs/canon/locations/unrelated.md'), 'UNRELATED_CANON');
  const run = (args = ['--brief', b, '--root', root]) =>
    spawnSync(process.execPath, [path.resolve('scripts/build-prompt.mjs'), ...args], { encoding: 'utf8' });
  const first = run();
  expect(first.status).toBe(0);
  expect(run().stdout).toBe(first.stdout);
  for (const text of ['Public fixture.', "the Exchange clerk's desk", 'clean: the stallholder refunds your crew'])
    expect(first.stdout).toContain(text);
  for (const text of [
    'state_nouns',
    'sensory_details_used',
    'citation',
    'COORDINATOR_ONLY',
    'UNRELATED_CANON',
    'PRIVATE_METADATA',
  ])
    expect(first.stdout).not.toContain(text);
  expect(first.stdout.match(/^## \d+\./gm)).toEqual(['## 3.', '## 4.', '## 5.', '## 7.']);
  for (const args of [[], ['--brief'], ['--unknown', b], ['--brief', b, '--brief', b]])
    expect(run(args).status).toBe(1);
  const contractFile = path.join(root, 'docs/CONTENT_GENERATION.md'),
    contract = fs.readFileSync(contractFile, 'utf8');
  for (const invalid of [
    contract.replace('## 5. Section', '## Missing Section'),
    contract + '\n## 3. Duplicate\nText',
    contract.replace('## 3. Section', '## 3 Section'),
  ]) {
    fs.writeFileSync(contractFile, invalid);
    const failed = run();
    expect(failed.status).toBe(1);
    expect(failed.stderr).toMatch(/content contract section [35]/);
  }
  fs.writeFileSync(contractFile, contract);
  fs.writeFileSync(b, JSON.stringify({ ...brief, location: 'docs/canon-gm/private.md' }));
  expect(run().status).toBe(1);
});
it('rejects a prompt location whose parent is a symlink', context => {
  const { root, brief } = fixture(),
    b = path.join(root, 'brief.json');
  fs.writeFileSync(b, JSON.stringify(brief));
  fs.writeFileSync(
    path.join(root, 'docs/CONTENT_GENERATION.md'),
    [3, 4, 5, 7].map(n => `## ${n}. Section\nText`).join('\n'),
  );
  const original = path.join(root, 'docs/canon/locations'),
    moved = original + '-real';
  try {
    fs.renameSync(original, moved);
    fs.symlinkSync(moved, original, 'junction');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EPERM')
      return context.skip('Host denies junction creation; CI exercises this check');
    throw error;
  }
  const run = spawnSync(process.execPath, [path.resolve('scripts/build-prompt.mjs'), '--brief', b, '--root', root], {
    encoding: 'utf8',
  });
  expect(run.status).toBe(1);
  expect(run.stderr).toContain('Symlink');
});

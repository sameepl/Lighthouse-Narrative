#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { lintDirectory, lintRoster, parseScene } from './content-lint.mjs';

const grades = ['clean', 'cost', 'fail'];
const safe = z
  .string()
  .refine(s => s.trim().length > 0)
  .min(1)
  .refine(
    s => !/[\x00-\x1f\x7f-\x9f\u2028\u2029\\{}|\[\]#~*=<>]|->|<-|<>|\/\/|\/\*|\*\/|\b(?:add|note|trust)\s*\(/u.test(s),
    'Unsafe Ink text',
  );
const effect = z.tuple([z.string().min(1), z.number().int().safe()]);
const effects = z.strictObject(Object.fromEntries(grades.map(g => [g, z.array(effect).min(1).max(2)])));
const approach = z.strictObject({
  label: safe.refine(s => {
    const n = s.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
    return n >= 3 && n <= 8;
  }, 'Labels need 3–8 words'),
  skills: z.array(z.string().regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/)).length(2),
  npc_reaction: safe,
  effects,
});
const briefSchema = z.strictObject({
  id: z.string().regex(/^stub_[a-z0-9]+(?:_[a-z0-9]+)*$/, 'Assembler IDs must start stub_'),
  archetype: z.enum(['trade_run', 'courier', 'salvage', 'scout', 'distress_call', 'standoff']),
  layer: z.enum(['commercial', 'crisis']),
  location: z.string().regex(/^docs\/canon\/locations\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/),
  who: safe,
  want: safe,
  at_stake: safe,
  complication: safe,
  approaches: z.array(approach).length(3),
  title: safe.optional(),
  state_nouns: z.array(safe).optional(),
  loud_quiet: z.record(z.string(), z.enum(['loud', 'quiet'])).optional(),
  sensory_details_used: z.record(z.string(), safe).optional(),
});
// Only the literal leading marker is exempt from the bracket restriction.
const passage = z
  .string()
  .refine(s => s.startsWith('[STUB] ') && safe.safeParse(s.slice(7)).success, 'Expected safe [STUB] passage');
const outcome = z.strictObject({
  text: passage,
  note: z.string().refine(s => safe.safeParse(s.replace(/^\[STUB\] /, '')).success, 'Unsafe note'),
});
const outputSchema = z.strictObject({
  open: passage,
  outcomes: z.record(z.string(), z.strictObject(Object.fromEntries(grades.map(g => [g, outcome])))),
  ending: passage,
});

function safePath(root, relative, directory = false) {
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Symlink path refused: ' + relative);
  }
  const info = fs.lstatSync(current);
  if (directory ? !info.isDirectory() : !info.isFile()) throw new Error('Wrong path type: ' + relative);
  if (!fs.realpathSync(current).startsWith(root + path.sep)) throw new Error('Path escaped repository: ' + relative);
  return current;
}

/** Validate, lint and exclusively create both files. No files are written on validation failure. */
export function assembleScene(briefInput, writerInput, repositoryRoot = '.') {
  const brief = briefSchema.parse(briefInput),
    writer = outputSchema.parse(writerInput);
  const labels = brief.approaches.map(a => a.label);
  if (
    new Set(labels).size !== 3 ||
    Object.keys(writer.outcomes).length !== 3 ||
    labels.some(l => !Object.hasOwn(writer.outcomes, l))
  )
    throw new Error('Writer outcomes must use exactly three unique brief labels');
  const root = fs.realpathSync(repositoryRoot);
  const sceneDir = safePath(root, 'src/story/scenes', true),
    encounterDir = safePath(root, 'src/data/encounters', true);
  safePath(root, brief.location);
  const skillChar = JSON.parse(fs.readFileSync(safePath(root, 'src/data/rules.json'), 'utf8')).skillChar;
  if (brief.approaches.some(a => new Set(a.skills).size !== 2 || a.skills.some(s => !Object.hasOwn(skillChar, s))))
    throw new Error('Unknown or duplicate skills');
  const id = brief.id,
    knot = id + '_scene';
  const metadata = {
    id,
    location: brief.location,
    ...(brief.state_nouns && { state_nouns: brief.state_nouns }),
    ...(brief.loud_quiet && { loud_quiet: brief.loud_quiet }),
  };
  const encounter = {
    id,
    knot,
    title: '[STUB] ' + (brief.title ?? id.replaceAll('_', ' ')),
    layer: brief.layer,
    archetype: brief.archetype,
    tags: [],
    requires: {},
    repeat: { kind: 'once' },
    weight: 1,
    cost: 0,
    risk: '[STUB] ' + brief.at_stake,
    placeholder: true,
  };
  const menu = brief.approaches
    .map(
      (a, i) =>
        `+ [\\[STUB\\] ${a.label} #hint:\\[STUB\\] ${a.skills.join(' / ')}]\n    -> roll("${a.skills.join(',')}", 8, "", ${grades.map(g => `-> ${id}__a${i + 1}_${g}`).join(', ')})`,
    )
    .join('\n');
  const branches = brief.approaches
    .flatMap((a, i) =>
      grades.map(g => {
        const o = writer.outcomes[a.label][g];
        const note = '[STUB] ' + o.note.replace(/^\[STUB\] /, '');
        return `=== ${id}__a${i + 1}_${g} ===\n${o.text}\n${a.effects[g].map(([r, n]) => `~ add(${JSON.stringify(r)}, ${n})`).join('\n')}\n~ note("${g === 'clean' ? 'gain' : 'cost'}", ${JSON.stringify(note)})\n-> ${id}__after\n`;
      }),
    )
    .join('\n');
  const ink = `// @content ${JSON.stringify(metadata)}\n=== ${knot} ===\n${writer.open}\n-> ${id}__menu\n\n=== ${id}__menu ===\n${menu}\n\n${branches}\n=== ${id}__after ===\n${writer.ending} # summary\n-> scene_end\n`;
  const candidate = parseScene(ink, encounter);
  const errors = lintDirectory(root);
  const existing = fs
    .readdirSync(sceneDir)
    .filter(f => /^stub_.*\.ink$/.test(f))
    .map(f => {
      const text = fs.readFileSync(safePath(root, 'src/story/scenes/' + f), 'utf8');
      return parseScene(
        text,
        JSON.parse(fs.readFileSync(safePath(root, 'src/data/encounters/' + f.replace(/\.ink$/, '.json')), 'utf8')),
      );
    });
  errors.push(...lintRoster([...existing, candidate]));
  if (errors.length) throw new Error(errors.join('\n'));
  const files = [
    [path.join(sceneDir, id + '.ink'), ink],
    [path.join(encounterDir, id + '.json'), JSON.stringify(encounter, null, 2) + '\n'],
  ];
  const owned = [];
  try {
    // Reserve BOTH paths before the first write; never unlink an unowned destination.
    for (const [file, text] of files) owned.push({ file, text, fd: fs.openSync(file, 'wx') });
    for (const { fd, text } of owned) fs.writeFileSync(fd, text, 'utf8');
  } catch (error) {
    for (const { fd, file } of owned) {
      fs.closeSync(fd);
      fs.unlinkSync(file);
    }
    throw error;
  }
  for (const { fd } of owned) fs.closeSync(fd);
  return { ink, encounter, files: files.map(([file]) => file) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = {};
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i += 2) {
      if (!['--brief', '--passages', '--root'].includes(args[i]) || Object.hasOwn(options, args[i]) || !args[i + 1])
        throw new Error('Usage: assemble:scene -- --brief file --passages file [--root repository]');
      options[args[i]] = args[i + 1];
    }
    if (!options['--brief'] || !options['--passages']) throw new Error('Both --brief and --passages are required');
    const result = assembleScene(
      JSON.parse(fs.readFileSync(options['--brief'], 'utf8')),
      JSON.parse(fs.readFileSync(options['--passages'], 'utf8')),
      options['--root'],
    );
    console.log('Created ' + result.files.join(' and '));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

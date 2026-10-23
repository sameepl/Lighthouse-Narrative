#!/usr/bin/env node
import { closeSync, existsSync, mkdirSync, openSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const usage = 'npm run new:scene -- --id <snake_case> --archetype <a> --layer <crisis|commercial>';
const archetypes = ['trade_run', 'courier', 'salvage', 'scout', 'distress_call', 'standoff'];

try {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--id', '--archetype', '--layer'].includes(key) || key in options || !args[i + 1])
      throw new Error(`Unknown, duplicate or incomplete argument: ${key}. Usage: ${usage}`);
    options[key] = args[i + 1];
  }
  const id = options['--id'];
  const archetype = options['--archetype'];
  const layer = options['--layer'];
  if (!id || !/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(id)) throw new Error('id must be lowercase snake_case.');
  if (!archetypes.includes(archetype)) throw new Error(`archetype must be one of: ${archetypes.join(', ')}.`);
  if (!['crisis', 'commercial'].includes(layer)) throw new Error('layer must be crisis or commercial.');

  const approaches = [
    ['parley', 'Persuade,Diplomat'],
    ['coordinate', 'Leadership,Tactics'],
    ['inspect', 'Electronics,Mechanic'],
  ];
  const scene = `// [STUB] Replace all placeholder writing, hints, checks and consequences before publishing.
// Never write Marcus's speech, thoughts or actions. All local knots use the scene ID prefix.
=== ${id}_scene ===
[STUB] Describe the situation and the stakes. # bg:hall
-> ${id}__menu

=== ${id}__menu ===
${approaches
  .map(
    ([name, skills]) => `+ [\\[STUB\\] ${name} approach #hint:\\[STUB\\] ${skills.replaceAll(',', ' / ')}]
    -> roll("${skills}", 8, "", -> ${id}__${name}_clean, -> ${id}__${name}_cost, -> ${id}__${name}_fail)`,
  )
  .join('\n')}

${approaches
  .flatMap(([name]) =>
    ['clean', 'cost', 'fail'].map(
      grade => `=== ${id}__${name}_${grade} ===
[STUB] ${name}: ${grade === 'fail' ? 'Failure moves the story forward at a cost' : `${grade} outcome`}.
~ note("${grade === 'clean' ? 'gain' : 'cost'}", "[STUB] ${name} ${grade} consequence.")
-> ${id}__after
`,
    ),
  )
  .join('\n')}
=== ${id}__after ===
[STUB] Show what changed and what it cost. # summary
-> scene_end
`;
  const encounter = {
    id,
    knot: `${id}_scene`,
    title: `[STUB] ${id.replaceAll('_', ' ')}`,
    layer,
    archetype,
    tags: [],
    requires: {},
    repeat: { kind: 'once' },
    weight: 1,
    cost: 0,
    risk: '[STUB] Describe the risk.',
    placeholder: true,
  };
  const files = [
    [path.resolve('src/story/scenes', `${id}.ink`), scene],
    [path.resolve('src/data/encounters', `${id}.json`), `${JSON.stringify(encounter, null, 2)}\n`],
  ];
  for (const [file] of files) if (existsSync(file)) throw new Error(`Refusing to overwrite ${file}`);
  // Reserve both destinations exclusively before writing either. Roll back only files this run created.
  const created = [];
  try {
    for (const [file, text] of files) {
      mkdirSync(path.dirname(file), { recursive: true });
      created.push({ file, text, fd: openSync(file, 'wx') });
    }
    for (const { fd, text } of created) writeFileSync(fd, text, 'utf8');
  } catch (error) {
    for (const { fd, file } of created) {
      closeSync(fd);
      unlinkSync(file);
    }
    throw error;
  }
  for (const { fd } of created) closeSync(fd);
  console.log(`Created ${files.map(([file]) => file).join(' and ')}. Replace [STUB] content, then run npm test.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

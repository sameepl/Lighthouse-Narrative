#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { briefSchema, safePath } from './assemble-scene.mjs';

export function buildPrompt(input, repositoryRoot = '.') {
  const brief = briefSchema.parse(input);
  const root = fs.realpathSync(repositoryRoot);
  const contract = fs.readFileSync(safePath(root, 'docs/CONTENT_GENERATION.md'), 'utf8');
  const sections = contract.split(/(?=^## )/m);
  const selected = [3, 4, 5, 7].map(n => {
    const matching = sections.filter(s => s.startsWith(`## ${n}. `));
    if (matching.length !== 1) throw new Error(`Expected one content contract section ${n}`);
    return matching[0].trim();
  });
  const { sensory_details_used, state_nouns, places, effect_reasons, ...writerBrief } = brief;
  const instructions = [
    'BRIEF',
    JSON.stringify(writerBrief, null, 2),
    'PLACES (use only these named places and the named location)',
    ...(places ?? []).map(p => `- ${p}`),
    'EFFECT REASONS (all effects apply to your crew or your ship; show the named exchange)',
    ...brief.approaches.flatMap(a =>
      effect_reasons ? [a.label, ...['clean', 'cost', 'fail'].map(g => `  ${g}: ${effect_reasons[a.label][g]}`)] : [],
    ),
    ...selected,
    `LOCATION: ${brief.location}`,
    fs.readFileSync(safePath(root, brief.location), 'utf8').trim(),
  ];
  return instructions.join('\n\n') + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = {};
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i += 2) {
      if (!['--brief', '--root'].includes(args[i]) || Object.hasOwn(options, args[i]) || !args[i + 1])
        throw new Error('Usage: build:prompt -- --brief file [--root repository]');
      options[args[i]] = args[i + 1];
    }
    if (!options['--brief']) throw new Error('--brief is required');
    process.stdout.write(buildPrompt(JSON.parse(fs.readFileSync(options['--brief'], 'utf8')), options['--root']));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

#!/usr/bin/env node
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintScene } from './content-gates.mjs';
const grades = ['clean', 'cost', 'fail'];
const words = text => text.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
const validId = value => typeof value === 'string' && /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value);
const locationPattern = /^docs\/canon\/locations\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
export function parseScene(ink, encounter) {
  const metadata = ink.match(/^\/\/ @content (.+)$/m);
  if (!metadata || [...ink.matchAll(/^\/\/ @content /gm)].length !== 1)
    throw new Error('Missing // @content JSON metadata');
  const meta = JSON.parse(metadata[1]);
  if (!meta || !validId(meta.id) || typeof meta.location !== 'string' || !locationPattern.test(meta.location))
    throw new Error('Invalid content id/location');
  if (
    meta.state_nouns !== undefined &&
    (!Array.isArray(meta.state_nouns) || meta.state_nouns.some(n => typeof n !== 'string' || !words(n).length))
  )
    throw new Error('state_nouns must be nonempty strings');
  if (!encounter || encounter.id !== meta.id || !validId(encounter.knot) || encounter.knot !== meta.id + '_scene')
    throw new Error('Encounter id/knot association mismatch');
  if (
    meta.loud_quiet !== undefined &&
    (!meta.loud_quiet ||
      typeof meta.loud_quiet !== 'object' ||
      Array.isArray(meta.loud_quiet) ||
      Object.values(meta.loud_quiet).some(v => !['loud', 'quiet'].includes(v)))
  )
    throw new Error('Invalid loud_quiet metadata');
  const knots = [...ink.matchAll(/^===\s*([a-z][a-z0-9_]*)\s*===\s*\r?$/gm)];
  if (new Set(knots.map(k => k[1])).size !== knots.length) throw new Error('Duplicate knots');
  const blocks = knots.map((k, i) => ({ name: k[1], body: ink.slice(k.index + k[0].length, knots[i + 1]?.index) }));
  if (
    ink
      .slice(0, knots[0]?.index)
      .split(/\r?\n/)
      .some(line => line.trim() && !line.trim().startsWith('//'))
  )
    throw new Error('Unsupported preamble controls');
  const entry = blocks.find(b => b.name === encounter.knot);
  const ending = blocks.find(b => b.name === `${meta.id}__after`);
  const outcomes = blocks.filter(b => grades.some(g => b.name.endsWith(`_${g}`)));
  const groups = new Map();
  for (const block of outcomes) {
    const match = block.name.match(new RegExp('^' + meta.id + '__([a-z][a-z0-9_]*)_(clean|cost|fail)$'));
    if (!match) throw new Error('Invalid outcome knot prefix');
    const found = groups.get(match[1]) ?? new Set();
    found.add(match[2]);
    groups.set(match[1], found);
  }
  const menu = blocks.find(b => b.name === meta.id + '__menu');
  if (
    !entry ||
    !ending ||
    !menu ||
    outcomes.length !== 9 ||
    groups.size !== 3 ||
    [...groups.values()].some(g => g.size !== 3) ||
    blocks.length !== 12
  )
    throw new Error('Expected entry, menu, after and three complete outcome groups');
  if (Object.keys(meta.loud_quiet ?? {}).some(name => !outcomes.some(b => b.name === name)))
    throw new Error('Unknown loud_quiet outcome');
  const menuLines = menu.body
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//'));
  if (menuLines.length !== 6) throw new Error('Expected three menu choices and rolls');
  const rolled = new Set();
  for (let i = 0; i < 6; i += 2) {
    if (!/^\+ \[(?:\\.|[^\[\]{}|])*#hint:(?:\\.|[^\[\]{}|])+\]$/.test(menuLines[i]))
      throw new Error('Unsupported menu choice');
    const roll = menuLines[i + 1].match(
      /^-> roll\("[A-Za-z ,]+", [1-9]\d*, "", -> ([a-z][a-z0-9_]*), -> ([a-z][a-z0-9_]*), -> ([a-z][a-z0-9_]*)\)$/,
    );
    if (
      !roll ||
      ![...groups.keys()].some(group =>
        grades.every((grade, j) => roll[j + 1] === meta.id + '__' + group + '_' + grade),
      )
    )
      throw new Error('Unsupported roll or outcome association');
    rolled.add(roll[1]);
  }
  if (rolled.size !== 3) throw new Error('Duplicate menu roll');
  const passage = b => {
    const lines = b.body.split(/\r?\n/).map(l => l.trim());
    const outcome = outcomes.includes(b);
    const destination = b === entry ? meta.id + '__menu' : b === ending ? 'scene_end' : meta.id + '__after';
    const executable = lines.filter(line => line && !line.startsWith('//'));
    if (
      executable.at(-1) !== '-> ' + destination ||
      lines.filter(l => l.startsWith('->')).join('') !== '-> ' + destination
    )
      throw new Error('Unsupported divert in ' + b.name);
    for (const line of lines) {
      if (!line || line.startsWith('//') || line.startsWith('->') || line === '# summary') continue;
      if (line.startsWith('~') && outcome && /^~ (?:add|note)\(/.test(line)) continue;
      if (/^[~+*=#-]/.test(line) || /(?<!\\)[{}|]|->|\b(?:add|note|trust)\s*\(/.test(line))
        throw new Error('Unsupported control in ' + b.name);
    }
    const text = lines
      .filter(l => l && !/^(?:~|->|\/\/|\+|\*|#)/.test(l))
      .map(l => l.replace(/\s+#.*$/, ''))
      .join(' ');
    const effects = [...b.body.matchAll(/^\s*~\s*add\("([^"]+)",\s*(-?\d+)\s*\)\s*$/gm)].map(m => [m[1], Number(m[2])]);
    const notes = [...b.body.matchAll(/^\s*~\s*note\("(?:gain|cost|watch)",\s*("(?:[^"\\]|\\.)*")\s*\)\s*$/gm)].map(m =>
      JSON.parse(m[1]),
    );
    // Reject unsupported calls rather than silently overlooking malformed effects or notes.
    if (
      (b.body.match(/\badd\s*\(/g) ?? []).length !== effects.length ||
      (b.body.match(/\bnote\s*\(/g) ?? []).length !== notes.length ||
      /\btrust\s*\(/.test(b.body)
    )
      throw new Error(`Unsupported effect/note syntax in ${b.name}`);
    return { name: b.name, text, effects, notes, grade: grades.find(g => b.name.endsWith(`_${g}`)) };
  };
  return { ...meta, encounter, open: passage(entry), ending: passage(ending), outcomes: outcomes.map(passage) };
}

export function lintRoster(scenes) {
  const locations = new Set();
  return scenes.flatMap(scene => {
    const duplicate = locations.has(scene.location) ? [`${scene.id}: location: duplicate ${scene.location}`] : [];
    locations.add(scene.location);
    return [...duplicate, ...lintScene(scene)];
  });
}

function safePath(root, relative, directory = false) {
  let current = path.resolve(root);
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (lstatSync(current).isSymbolicLink()) throw new Error('Symlink path is not allowed: ' + relative);
  }
  const info = lstatSync(current);
  if (directory ? !info.isDirectory() : !info.isFile()) throw new Error('Wrong path type: ' + relative);
  return current;
}
export function lintDirectory(root = '.') {
  const sceneDir = safePath(root, 'src/story/scenes', true);
  const encounterDir = safePath(root, 'src/data/encounters', true);
  const scenes = [],
    errors = [];
  for (const file of readdirSync(sceneDir)
    .filter(f => /^stub_.*\.ink$/.test(f))
    .sort()) {
    try {
      const sceneFile = safePath(root, 'src/story/scenes/' + file);
      const ink = readFileSync(sceneFile, 'utf8');
      const meta = JSON.parse(ink.match(/^\/\/ @content (.+)$/m)?.[1] ?? 'null');
      if (!meta || !validId(meta.id) || file !== `${meta.id}.ink`)
        throw new Error('Missing or mismatched content metadata');
      if (typeof meta.location !== 'string' || !locationPattern.test(meta.location))
        throw new Error('Invalid location namespace');
      safePath(root, meta.location);
      const encounterFile = safePath(root, 'src/data/encounters/' + meta.id + '.json');
      const encounter = JSON.parse(readFileSync(encounterFile, 'utf8'));
      scenes.push(parseScene(ink, encounter));
    } catch (error) {
      errors.push(`${file}: structure: ${error.message}`);
    }
  }
  for (const file of readdirSync(encounterDir)
    .filter(f => f.endsWith('.json'))
    .sort()) {
    try {
      const entry = JSON.parse(readFileSync(safePath(root, 'src/data/encounters/' + file), 'utf8'));
      if (!entry || !validId(entry.id) || file !== entry.id + '.json')
        throw new Error('Encounter filename/id mismatch');
      if (
        !['trade_run', 'courier', 'salvage', 'scout', 'distress_call', 'standoff'].includes(entry.archetype) ||
        entry.layer !== (['distress_call', 'standoff'].includes(entry.archetype) ? 'crisis' : 'commercial')
      )
        throw new Error('Encounter archetype/layer mismatch');
      if (file.startsWith('stub_') && !readdirSync(sceneDir).includes(file.replace(/\.json$/, '.ink')))
        throw new Error('orphan stub encounter');
    } catch (error) {
      errors.push(file + ': catalog: ' + error.message);
    }
  }
  return [...errors, ...lintRoster(scenes)];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 3) throw new Error('Usage: node scripts/content-lint.mjs [repository-root]');
    const errors = lintDirectory(process.argv[2]);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('Content lint passed.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

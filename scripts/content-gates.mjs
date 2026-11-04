#!/usr/bin/env node
import { readFileSync } from 'node:fs';

export const rules = JSON.parse(readFileSync(new URL('./content-rules.json', import.meta.url), 'utf8'));
const grades = ['clean', 'cost', 'fail'];
const words = text => text.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
const plain = text => text.replace(/^\[STUB\]\s*/, '');
const sentences = text =>
  plain(text)
    .split(/[.!?]+/)
    .map(words)
    .filter(s => s.length);
const contains = (text, phrase) => ` ${words(text).join(' ')} `.includes(` ${words(phrase).join(' ')} `);
const stops = new Set(rules.nominalStops.flatMap(group => group.split(/\s+/)));

// A deliberately bounded nominal chunk heuristic, not a part-of-speech tagger.
export function nounPhrases(text) {
  const result = [];
  for (const sentence of sentences(text)) {
    for (let i = 0; i < sentence.length; i++) {
      if (!['the', 'a', 'an', 'this', 'that', 'these', 'those', 'her', 'his', 'their', 'your'].includes(sentence[i]))
        continue;
      const chunk = [sentence[i]];
      for (const token of sentence.slice(i + 1)) {
        if (stops.has(token) || /^\d+$/.test(token)) break;
        chunk.push(token);
      }
      // Include each prefix: 'the old convoy master' repeats 'the old convoy' too.
      for (let length = 3; length <= chunk.length; length++) result.push(chunk.slice(0, length).join(' '));
    }
  }
  return result;
}

export function lintScene(scene) {
  const errors = [];
  const fail = (gate, passage, detail) => errors.push(`${scene.id}/${passage}: ${gate}: ${detail}`);
  const passages = [scene.open, ...scene.outcomes, scene.ending];
  const counts = new Map();
  for (const p of passages) {
    if (!p.text.startsWith('[STUB] ')) fail('marker', p.name, 'text must start [STUB]');
    const count = words(plain(p.text)).length;
    if (p === scene.ending ? count > 40 || count === 0 : count < 40 || count > 80)
      fail('words', p.name, `${count} words`);
    if (p !== scene.ending) {
      const lengths = sentences(p.text).map(sentence => sentence.length);
      if (lengths.length < 3 || lengths.length > 6 || !lengths.some(n => n > 12) || !lengths.some(n => n < 9))
        fail('sentence-shape', p.name, 'need 3–6 sentences, one over 12 words and one under 9');
    }
    for (const banned of rules.banned) if (contains(p.text, banned)) fail('banned', p.name, banned);
    for (const sentence of sentences(p.text)) {
      const key = sentence.slice(0, 2).join(' ');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  for (const [key, count] of counts) if (count > 2) fail('opener', 'scene', `${key} repeated ${count} times`);
  const phrases = new Map(),
    openings = new Set();
  for (const p of scene.outcomes) {
    const opening = words(plain(p.text)).slice(0, 4).join(' ');
    if (openings.has(opening)) fail('outcome-opening', p.name, opening);
    openings.add(opening);
    for (const phrase of nounPhrases(p.text)) phrases.set(phrase, (phrases.get(phrase) ?? 0) + 1);
    const effects = p.effects;
    if (!effects.length) fail('effect-required', p.name, p.grade);
    if (effects.length > 2 || new Set(effects.map(e => e[0])).size !== effects.length)
      fail('effect-band', p.name, 'at most two distinct effects');
    for (const [resource, value] of effects) {
      const band = rules.bands[p.grade]?.[resource];
      const pursuit =
        resource === 'Pursuit' &&
        value === (scene.loud_quiet?.[p.name] === 'loud' ? 1 : scene.loud_quiet?.[p.name] === 'quiet' ? -1 : 0) &&
        value !== 0;
      if (!pursuit && (!band || !Number.isInteger(value) || !band.some(([low, high]) => value >= low && value <= high)))
        fail('effect-band', p.name, `${resource} ${value}`);
    }
    const has = (r, test) => effects.some(([resource, value]) => resource === r && test(value));
    if (
      p.grade === 'clean' &&
      !effects.some(([r, n]) => (r === 'Credits' || r === 'Renown' ? n > 0 : r === 'Strain' && n < 0))
    )
      fail('clean-gain', p.name, 'no visible gain');
    if (
      p.grade === 'cost' &&
      !(has('Credits', n => n < 0) || (has('Credits', n => n >= 0) && has('Strain', n => n > 0)))
    )
      fail('effect-band', p.name, 'cost requires negative Credits or nonnegative Credits with Strain +1');
    if (p.grade === 'fail' && !(has('Credits', n => n < 0) || has('Strain', n => n > 0)))
      fail('effect-band', p.name, 'fail requires a Credits or Strain cost');
    const expected = effects.map(([r, n]) => `${r} ${n >= 0 ? '+' : ''}${n}`).sort();
    const note = p.notes.join(', ').replaceAll(',', '');
    const actual = [...note.matchAll(/\b(Credits|Strain|Renown|Pursuit|Edge)\s+([+-]\d+)\b/g)]
      .map(m => `${m[1]} ${Number(m[2]) >= 0 ? '+' : ''}${Number(m[2])}`)
      .sort();
    const residue = note.replace(/\b(Credits|Strain|Renown|Pursuit|Edge)\s+[+-]\d+\b/g, '');
    if (p.notes.length !== 1 || JSON.stringify(expected) !== JSON.stringify(actual) || /\d/.test(residue))
      fail('note-effects', p.name, 'signed resource numbers must match add calls exactly');
  }
  for (const [phrase, count] of phrases)
    if (count > 2) fail('noun-phrase', 'outcomes', `${phrase} repeated ${count} times`);
  for (const noun of [...rules.endingNouns, ...(scene.state_nouns ?? [])])
    if (contains(scene.ending.text, noun)) fail('ending-state', scene.ending.name, noun);
  const expectedLayer = ['distress_call', 'standoff'].includes(scene.encounter.archetype) ? 'crisis' : 'commercial';
  if (
    !['trade_run', 'courier', 'salvage', 'scout', 'distress_call', 'standoff'].includes(scene.encounter.archetype) ||
    scene.encounter.layer !== expectedLayer
  )
    fail('layer', 'encounter', 'archetype/layer mismatch');
  return errors;
}

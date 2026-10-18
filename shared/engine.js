// State engine for data-driven stories. Pure functions over plain-object state.
// Roll flow: pick approach -> staged (Try it / Odds / Back) -> roll -> [Edge offer] -> outcome.
import { story as defaultStory } from './story.js';

export const CLEAN_MARGIN = 2; // total >= target+2 is clean; target..target+1 is success with a cost
export const charMod = n => (n <= 2 ? -2 : n <= 5 ? -1 : n <= 8 ? 0 : n <= 11 ? 1 : 2);
export const GRADE_LABEL = { clean: 'Clean success', cost: 'Success with a cost', fail: 'Failure' };

export function newState(story = defaultStory) {
  const p = story.player;
  return { node: story.start, chars: { ...p.chars }, skills: { ...p.skills }, res: { ...p.res },
    flags: [], taken: [], ledger: [], staged: null, pending: null };
}

const d6 = () => 1 + Math.floor(Math.random() * 6);
const roll2d6 = () => [d6(), d6()];
const gradeOf = (total, target) => (total >= target + CLEAN_MARGIN ? 'clean' : total >= target ? 'cost' : 'fail');
const signed = n => (n >= 0 ? `+${n}` : `${n}`);

function visible(c, s) {
  if (c.if?.flag && !s.flags.includes(c.if.flag)) return false;
  if (c.if?.notFlag && s.flags.includes(c.if.notFlag)) return false;
  return true;
}

function rollSetup(s, check, story) {
  let best = null;
  for (const k of check.skills) {
    const n = s.skills[k] ?? 0;
    if (!best || n > best.n) best = { label: k, n };
  }
  const ch = story.skillChar[best.label];
  const parts = [best, { label: ch, n: charMod(s.chars[ch]) }];
  for (const b of check.bonus ?? []) if (s.flags.includes(b.flag)) parts.push({ label: b.label, n: b.n });
  return { parts, mod: parts.reduce((a, p) => a + p.n, 0) };
}

export function odds(s, check, story = defaultStory) {
  const { parts, mod } = rollSetup(s, check, story);
  let win = 0, clean = 0;
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    const g = gradeOf(a + b + mod, check.target);
    if (g !== 'fail') win++;
    if (g === 'clean') clean++;
  }
  return { target: check.target, mod, parts: parts.map(p => `${p.label} ${signed(p.n)}`),
    success: Math.round((win / 36) * 100), clean: Math.round((clean / 36) * 100) };
}

export function view(s, story = defaultStory) {
  const n = story.nodes[s.node];
  const hud = { ...s.res, reserve: story.reserve, max: story.player.max };
  const base = { bg: n.bg, hud, end: !!n.end, odds: null };
  if (s.pending) {
    const p = s.pending, ch = [];
    if (p.grade !== 'clean' && s.res.Edge > 0 && !p.edgeUsed) {
      ch.push({ id: 'edge', kind: 'edge', text: `Spend Edge — ${p.grade === 'fail' ? 're-roll' : 'make it clean'}`, sub: `${s.res.Edge} left` });
    }
    ch.push({ id: 'accept', kind: 'accept', text: 'Accept the result' });
    return { ...base, choices: ch };
  }
  if (s.staged) {
    const c = n.choices[s.staged.i];
    return { ...base, odds: s.staged.odds ? odds(s, c.check, story) : null,
      choices: [{ id: 'try', kind: 'try', text: 'Try it' }, { id: 'odds', kind: 'odds', text: 'Odds' }, { id: 'back', kind: 'back', text: 'Back' }] };
  }
  const choices = n.choices.map((c, i) => ({ c, i })).filter(({ c, i }) => visible(c, s))
    .map(({ c, i }) => ({ id: i, kind: 'choice', text: c.text, sub: c.sub }));
  return { ...base, choices };
}

export function sheet(s, story = defaultStory) {
  return {
    chars: Object.entries(s.chars).map(([k, v]) => ({ k, score: v, mod: charMod(v) })),
    skills: Object.entries(s.skills).map(([k, lvl]) => ({ k, lvl })),
    ledger: s.ledger,
  };
}

const isSpeech = html => /^(<[^>]+>)*[“"]/.test(html);
const para = html => ({ type: 'para', html, speech: isSpeech(html) });
const asList = t => (Array.isArray(t) ? t : t ? [t] : []);

export function introEvents(s, story = defaultStory) {
  const n = story.nodes[s.node], ev = n.text.map(para);
  if (n.summary) ev.push({ type: 'summary', items: s.ledger });
  return ev;
}

function applyFx(s, fx = {}, events, story) {
  for (const [k, v] of Object.entries(fx.add ?? {})) {
    const max = story.player.max[k] ?? Infinity;
    s.res[k] = Math.min(max, Math.max(0, (s.res[k] ?? 0) + v));
  }
  for (const f of fx.flags ?? []) if (!s.flags.includes(f)) s.flags.push(f);
  for (const n of fx.notes ?? []) { s.ledger.push(n); events.push({ type: 'note', ...n }); }
}

function enter(s, goto, events, story) {
  if (goto) s.node = goto;
  events.push(...introEvents(s, story));
}

function finalize(s, events, story) {
  const c = story.nodes[s.node].choices[s.pending.i];
  const out = c.check.grades[s.pending.grade];
  s.pending = null;
  asList(out.text).forEach(t => events.push(para(t)));
  applyFx(s, out.fx, events, story);
  enter(s, out.goto, events, story);
}

function rollEvent(p, extra = {}) {
  return { type: 'roll', dice: p.dice, mod: p.mod, total: p.total, grade: p.grade, label: GRADE_LABEL[p.grade], ...extra };
}

function doRoll(s, check, rng, story) {
  const { parts, mod } = rollSetup(s, check, story);
  const dice = rng(), total = dice[0] + dice[1] + mod;
  return { i: s.staged.i, dice, mod, total, grade: gradeOf(total, check.target), edgeUsed: false, target: check.target, parts };
}

// id: choice index (number) or 'try' | 'odds' | 'back' | 'edge' | 'accept'. Returns { state, events }.
export function choose(prev, id, story = defaultStory, rng = roll2d6) {
  const s = structuredClone(prev), events = [];
  const n = story.nodes[s.node];
  if (id === 'back') s.staged = null;
  else if (id === 'odds') s.staged.odds = true;
  else if (id === 'try') {
    const c = n.choices[s.staged.i];
    s.pending = doRoll(s, c.check, rng, story);
    s.staged = null;
    events.push(rollEvent(s.pending));
    if (s.pending.grade === 'clean' || s.res.Edge <= 0) finalize(s, events, story);
  } else if (id === 'edge') {
    const p = s.pending;
    s.res.Edge -= 1; p.edgeUsed = true;
    if (p.grade === 'fail') {
      const c = n.choices[p.i];
      s.staged = { i: p.i };
      const r = doRoll(s, c.check, rng, story);
      s.staged = null;
      s.pending = { ...r, edgeUsed: true };
      events.push(rollEvent(s.pending, { edge: 'Edge spent: re-rolled' }));
    } else {
      p.grade = 'clean';
      events.push(rollEvent(p, { edge: 'Edge spent: upgraded' }));
    }
    finalize(s, events, story);
  } else if (id === 'accept') finalize(s, events, story);
  else if (typeof id === 'number') {
    const c = n.choices[id];
    events.push({ type: 'pick', html: c.text });
    if (c.check) s.staged = { i: id, odds: false };
    else {
      applyFx(s, c.fx, events, story);
      enter(s, c.goto, events, story);
    }
  }
  return { state: s, events };
}

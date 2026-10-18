// The game's rules as pure functions. No ink, no React, no globals: easy to test and to reason about.
import type { Character, Rules } from '../data/schema';
import type { CheckRequest, Dice, GameState, Grade, OddsInfo, Rng, RollPart, RollResult, RollSetup } from './types';

export const GRADE_LABEL: Record<Grade, string> = {
  clean: 'Clean success',
  cost: 'Success with a cost',
  fail: 'Failure',
};

const d6 = () => 1 + Math.floor(Math.random() * 6);
export const rollDice: Rng = () => [d6(), d6()];

/** Characteristic score to modifier, using the table in rules.json (score <= max gives mod). */
export function charMod(score: number, rules: Rules): number {
  for (const [max, mod] of rules.charMods) if (score <= max) return mod;
  return rules.charMods[rules.charMods.length - 1]![1];
}

/** total >= target + cleanMargin is clean; target..target+cleanMargin-1 succeeds with a cost; below fails. */
export function gradeOf(total: number, target: number, rules: Rules): Grade {
  if (total >= target + rules.cleanMargin) return 'clean';
  return total >= target ? 'cost' : 'fail';
}

export function setupRoll(
  character: Character, rules: Rules, req: CheckRequest, isActive: (flag: string) => boolean,
): RollSetup {
  let best: RollPart | null = null;
  for (const skill of req.skills) {
    if (!(skill in rules.skillChar)) throw new Error(`Unknown skill "${skill}" in a check. Known: ${Object.keys(rules.skillChar).join(', ')}`);
    const n = character.skills[skill] ?? 0;
    if (!best || n > best.n) best = { label: skill, n };
  }
  if (!best) throw new Error('A check needs at least one skill');
  const ch = rules.skillChar[best.label]!;
  const parts: RollPart[] = [best, { label: ch, n: charMod(character.chars[ch], rules) }];
  for (const flag of req.bonuses) {
    const b = rules.bonuses[flag];
    if (!b) throw new Error(`Unknown bonus "${flag}" in a check. Known: ${Object.keys(rules.bonuses).join(', ')}`);
    if (isActive(flag)) parts.push({ label: b.label, n: b.n });
  }
  return { parts, mod: parts.reduce((sum, p) => sum + p.n, 0), target: req.target };
}

export const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export function oddsOf(setup: RollSetup, rules: Rules): OddsInfo {
  let win = 0, clean = 0;
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    const g = gradeOf(a + b + setup.mod, setup.target, rules);
    if (g !== 'fail') win++;
    if (g === 'clean') clean++;
  }
  return {
    target: setup.target, mod: setup.mod,
    parts: setup.parts.map(p => `${p.label} ${signed(p.n)}`),
    success: Math.round((win / 36) * 100), clean: Math.round((clean / 36) * 100),
  };
}

export function makeRoll(setup: RollSetup, rules: Rules, rng: Rng = rollDice): RollResult {
  const dice: Dice = rng();
  const total = dice[0] + dice[1] + setup.mod;
  const grade = gradeOf(total, setup.target, rules);
  return { dice, mod: setup.mod, total, grade, label: GRADE_LABEL[grade] };
}

/** Edge: a failure is re-rolled (the new result stands); a success-with-a-cost becomes clean. */
export function spendEdge(prev: RollResult, setup: RollSetup, rules: Rules, rng: Rng = rollDice): RollResult {
  if (prev.grade === 'clean') throw new Error('Edge cannot improve a clean success');
  if (prev.grade === 'fail') return { ...makeRoll(setup, rules, rng), edge: 'Edge spent: re-rolled' };
  return { ...prev, grade: 'clean', label: GRADE_LABEL.clean, edge: 'Edge spent: upgraded' };
}

// ---- resources ---------------------------------------------------------------------

export function newGameState(rules: Rules): GameState {
  return { res: Object.fromEntries(Object.entries(rules.resources).map(([k, v]) => [k, v.start])), ledger: [] };
}

/** Adds delta to a resource, clamped to its min/max. An unknown name throws, so a typo in ink fails loudly. */
export function addResource(res: Record<string, number>, rules: Rules, name: string, delta: number): number {
  const def = rules.resources[name];
  if (!def) throw new Error(`Unknown resource "${name}". Known: ${Object.keys(rules.resources).join(', ')}`);
  const next = Math.min(def.max ?? Infinity, Math.max(def.min, (res[name] ?? def.start) + delta));
  res[name] = next;
  return next;
}

import type { GameData } from '../data/validate';
import { assistOf } from '../engine/cycle';
import { setupRoll } from '../engine/rules';
import type { CheckRequest, RollSetup } from '../engine/types';

/** Evaluate each allowed skill with its best assigned assist; assists never stack. */
export function assistedSetup(
  data: GameData,
  request: CheckRequest,
  active: (flag: string) => boolean,
  crewIds: string[],
): RollSetup {
  let best: RollSetup | undefined;
  for (const skill of request.skills) {
    const setup = setupRoll(data.character, data.rules, { ...request, skills: [skill] }, active);
    const assigned = data.crew
      .filter(c => crewIds.includes(c.id))
      .map(crew => ({ crew, assist: assistOf(crew, data.rules) }))
      .filter(c => c.assist.skill === skill)
      .sort((a, b) => b.assist.n - a.assist.n);
    const first = assigned[0];
    if (first) {
      setup.parts.push({ label: `${first.crew.name} assist`, n: first.assist.n });
      setup.mod += first.assist.n;
    }
    if (!best || setup.mod > best.mod) best = setup;
  }
  if (!best) throw new Error('A check needs at least one skill');
  return best;
}

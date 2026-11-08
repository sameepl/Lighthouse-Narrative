export type HintId = 'board' | 'prepare' | 'odds' | 'edge';
const KEY = 'lighthouse-narrative-hints';
const seen = new Set<HintId>();
export function hintSeen(id: HintId): boolean {
  try {
    return seen.has(id) || JSON.parse(localStorage.getItem(KEY) ?? '[]').includes(id);
  } catch {
    return seen.has(id);
  }
}
export function markHintSeen(id: HintId): void {
  seen.add(id);
  try {
    const previous: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    const entries = Array.isArray(previous) ? previous.filter(v => typeof v === 'string') : [];
    localStorage.setItem(KEY, JSON.stringify([...new Set([...entries, ...seen])]));
  } catch {
    /* hints remain usable without storage */
  }
}

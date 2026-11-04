export interface Passage {
  name: string;
  text: string;
  effects: [string, number][];
  notes: string[];
  grade?: string;
}
export interface Scene {
  id: string;
  location: string;
  state_nouns?: string[];
  loud_quiet?: Record<string, 'loud' | 'quiet'>;
  encounter: { id: string; knot: string; archetype: string; layer: string };
  open: Passage;
  ending: Passage;
  outcomes: Passage[];
}
export const rules: {
  banned: string[];
  bands: Record<string, Record<string, [number, number][]>>;
  endingNouns: string[];
  nominalStops: string[];
};
export function nounPhrases(text: string): string[];
export function lintScene(scene: Scene): string[];

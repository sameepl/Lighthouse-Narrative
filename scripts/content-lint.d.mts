import type { Scene } from './content-gates.mjs';
export type { Scene } from './content-gates.mjs';
export function parseScene(ink: string, encounter: Scene['encounter']): Scene;
export function lintRoster(scenes: Scene[]): string[];
export function lintDirectory(root?: string): string[];

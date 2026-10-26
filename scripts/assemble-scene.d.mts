import type { Encounter } from '../src/data/schema';
export interface AssembledScene {
  ink: string;
  encounter: Encounter;
  files: string[];
}
export function assembleScene(brief: unknown, writer: unknown, repositoryRoot?: string): AssembledScene;

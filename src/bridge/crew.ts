import type { GameData } from '../data/validate';

/** Assignment permission and per-cycle availability are separate from catalog membership. */
export const availableCrew = (data: GameData, busyCrewIds: readonly string[]) =>
  data.crew.filter(member => member.assignable === true && !busyCrewIds.includes(member.id));

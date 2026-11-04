import type { Encounter, Keystone, Season } from '../src/data/schema';

/** M0 policy: empty requirements keep opening/finale safe under any depleted state.
 * Deliberately conservative: even vacuous requirements need a policy review.
 * This audits metadata and wiring, not playable completion or resource economy.
 */
export function auditReachability(
  encounters: readonly Encounter[],
  keystones: readonly Keystone[],
  season: Season,
  files: Record<string, unknown>,
): string[] {
  const errors: string[] = [];
  const catalog = new Map(keystones.map(key => [key.id, key]));
  const source = (id: string, kind: string) =>
    Object.entries(files).find(([, value]) => (value as { id?: string }).id === id)?.[0] ??
    `src/data/${kind}/${id}.json`;
  const fail = (id: string, kind: string, message: string) => errors.push(`${source(id, kind)} [${id}]: ${message}`);
  for (const entry of encounters) {
    if (entry.lead && !catalog.has(entry.lead)) fail(entry.id, 'encounters', `lead: unknown key ${entry.lead}`);
  }
  for (const key of keystones) {
    const lead = key.availableWhen.lead;
    if (lead && !catalog.has(lead)) fail(key.id, 'keystones', `availableWhen.lead: unknown key ${lead}`);
    if (lead && !encounters.some(entry => entry.lead === lead))
      fail(key.id, 'keystones', `availableWhen.lead: no encounter producer for ${lead}`);
  }
  if (season.status === 'unconfigured') return errors;
  const assigned = new Set([season.full.firstId, ...season.full.middleIds, season.full.finaleId]);
  // Extra catalog keys have no scheduled role; validate their full-run horizon without assigning one.
  for (const key of keystones)
    if (!assigned.has(key.id) && key.deadline > 6)
      fail(key.id, 'keystones', 'unassigned catalog deadline exceeds cycle 6');
  for (const mode of ['slice', 'full'] as const) {
    const roles = season[mode];
    const horizon = mode === 'slice' ? 4 : 6;
    // Only scheduled roles are reachable in this mode: full's conditional is absent in slice.
    for (const id of [roles.firstId, ...roles.middleIds, roles.finaleId]) {
      const key = catalog.get(id);
      if (!key) {
        errors.push(`src/data/season.json [${id}]: ${mode} role missing from keystone catalog`);
        continue;
      }
      if (key.deadline > horizon) fail(id, 'keystones', `${mode} deadline exceeds cycle ${horizon}`);
      if ((id === roles.firstId || id === roles.finaleId) && Object.keys(key.requires).length)
        fail(id, 'keystones', `${mode} opening/finale requires must be empty`);
    }
  }
  return errors;
}

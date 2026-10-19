export interface ZoneRule {
  allow: string[];
  deny?: string[];
}
export interface ZoneConfig {
  zones: Record<string, ZoneRule>;
}
export function globToRegExp(glob: string): RegExp;
export function resolveZone(
  input: { labels?: string[]; branch?: string },
  config: ZoneConfig,
): { zone: string } | { error: string };
export function checkZones(
  input: { zone: string; files: string[] },
  config: ZoneConfig,
): { ok: boolean; violations: string[] };

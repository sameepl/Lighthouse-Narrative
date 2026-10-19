#!/usr/bin/env node
// Fails a PR that touches files outside the zone it declared. See docs/AGENT_WORKFLOW.md and .github/zones.json.
// Env: PR_LABELS (JSON array of label names), HEAD_REF (branch name), BASE_REF (default origin/main).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function globToRegExp(glob) {
  const body = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*');
  return new RegExp(`^${body}$`);
}

const matches = (file, globs) => globs.some(g => globToRegExp(g).test(file));

/** A zone comes from a `zone:<name>` label, else from a `<name>/` branch prefix. Returns null if undeclared. */
export function resolveZone({ labels = [], branch = '' }, config) {
  const names = Object.keys(config.zones);
  const fromLabels = labels
    .map(l => l.replace(/^zone:/, ''))
    .filter((n, i) => labels[i].startsWith('zone:') && names.includes(n));
  if (fromLabels.length > 1) return { error: `Several zone labels set: ${fromLabels.join(', ')}. Use exactly one.` };
  if (fromLabels.length === 1) return { zone: fromLabels[0] };
  const prefix = branch.split('/')[0];
  if (branch.includes('/') && names.includes(prefix)) return { zone: prefix };
  return {
    error: `No zone declared. Add a label (${names.map(n => `zone:${n}`).join(', ')}) or name the branch <zone>/<topic>.`,
  };
}

export function checkZones({ zone, files }, config) {
  const rule = config.zones[zone];
  if (!rule) return { ok: false, violations: [`Unknown zone "${zone}"`] };
  const violations = files.filter(f => !matches(f, rule.allow) || matches(f, rule.deny ?? []));
  return { ok: violations.length === 0, violations };
}

function main() {
  const config = JSON.parse(readFileSync(new URL('../.github/zones.json', import.meta.url), 'utf8'));
  const labels = JSON.parse(process.env.PR_LABELS || '[]');
  const branch = process.env.HEAD_REF || execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const base = process.env.BASE_REF || 'origin/main';
  const resolved = resolveZone({ labels, branch }, config);
  if (resolved.error) {
    console.error(`Zone check failed: ${resolved.error}`);
    process.exit(1);
  }
  const files = execSync(`git diff --name-only ${base}...HEAD`).toString().split('\n').filter(Boolean);
  const { ok, violations } = checkZones({ zone: resolved.zone, files }, config);
  console.log(`Zone: ${resolved.zone}. ${files.length} changed file(s).`);
  if (!ok) {
    console.error(
      `These files are outside the "${resolved.zone}" zone:\n${violations.map(v => `  - ${v}`).join('\n')}`,
    );
    console.error(
      'Either move that change into a separate PR with the right zone, or ask the owner to relabel this one.',
    );
    process.exit(1);
  }
  console.log('Zone check passed.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

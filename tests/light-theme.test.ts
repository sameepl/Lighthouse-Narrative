import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const css = readFileSync('src/ui/theme.css', 'utf8');
const tokens = (rule: string) =>
  Object.fromEntries([...rule.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map(m => [m[1]!, m[2]!.trim()]));
const explicit = tokens(css.match(/:root\[data-theme='light'\]\s*\{([^}]+)\}/)![1]!);
const automatic = tokens(css.match(/:root:not\(\[data-theme='dark'\]\)\s*\{([^}]+)\}/)![1]!);
function luminance(hex: string) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map(c => c + c).join('') : value;
  const rgb = [0, 2, 4].map(i => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}
it('keeps manual and system light palettes equivalent and normal text legible on both surfaces', () => {
  expect(explicit).toEqual(automatic);
  for (const text of ['fg', 'dim', 'amber', 'green', 'warn'])
    for (const surface of ['bg', 'panel'])
      expect(contrast(explicit[text]!, explicit[surface]!), `${text} on ${surface}`).toBeGreaterThanOrEqual(4.5);
  expect(contrast(explicit['on-accent']!, explicit.amber!)).toBeGreaterThanOrEqual(4.5);
});
it('retains control boundaries and focus contrast without washing out the illustration', () => {
  for (const surface of ['bg', 'panel']) {
    expect(contrast(explicit.line!, explicit[surface]!)).toBeGreaterThanOrEqual(3);
    expect(contrast(explicit.amber!, explicit[surface]!)).toBeGreaterThanOrEqual(3);
  }
  expect(Number(explicit.art)).toBeGreaterThanOrEqual(0.85);
  expect(Number(explicit.art)).toBeLessThanOrEqual(1);
});

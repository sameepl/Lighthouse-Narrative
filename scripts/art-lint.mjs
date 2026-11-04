import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const assets = (dir = 'src/ui/assets') =>
  readdirSync(dir, { recursive: true })
    .filter(f => f.endsWith('.svg'))
    .sort()
    .map(f => ({ name: basename(f, '.svg'), svg: readFileSync(join(dir, f), 'utf8') }));
export function palette(hex, name) {
  const h = hex.slice(1);
  const [r, g, b] = (h.length === 3 ? [...h].map(c => c + c) : h.match(/../g)).map(c => parseInt(c, 16));
  const hi = Math.max(r, g, b),
    lo = Math.min(r, g, b);
  return (
    hi - lo <= 18 ||
    (b >= r && b >= g && g >= r) ||
    (r >= 120 && g >= r * 0.5 && g <= r * 0.85 && b <= g * 0.7) ||
    (g >= 100 && b >= g && r <= g * 0.65) ||
    (name === 'skirmish' && r >= 180 && g >= 60 && g <= r * 0.5 && b <= g * 0.8)
  );
}
export function inspect({ name, svg }) {
  const errors = [];
  const fail = s => errors.push(s);
  const root =
    svg
      .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, '')
      .trim()
      .match(/^<svg\b[^>]*>/)?.[0] ?? '';
  if (!root) fail('root svg required');
  const attr = key => root.match(new RegExp(`(?:^|\\s)${key}\\s*=\\s*["']([^"']*)["']`))?.[1];
  if (attr('viewBox') !== '0 0 600 300') fail('viewBox must be 0 0 600 300');
  if (attr('preserveAspectRatio') !== 'xMidYMin slice') fail('preserveAspectRatio must be xMidYMin slice');
  if (Buffer.byteLength(svg) > 14 * 1024) fail('file exceeds 14 KiB');
  for (const tag of [
    'image',
    'script',
    'text',
    'filter',
    'foreignObject',
    'font',
    'font-face',
    'animate',
    'animateTransform',
    'animateMotion',
    'set',
  ])
    if (new RegExp(`<\\s*(?:[\\w-]+:)?${tag}\\b`, 'i').test(svg)) fail(`forbidden element: ${tag}`);
  if (/\bfont(?:-family|-face)?\s*[:=]|@font-face/i.test(svg)) fail('fonts forbidden');
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet|@import|\bon\w+\s*=/i.test(svg))
    fail('active or external markup forbidden');
  for (const m of svg.matchAll(/(?:href\s*=\s*["']([^"']*)["']|url\(\s*["']?([^)'"\s]+))/gi))
    if (!(m[1] ?? m[2]).startsWith('#')) fail(`external reference: ${m[1] ?? m[2]}`);
  if (/[\\\\&]|\/\*/.test(svg)) fail('unsupported escapes, entities or CSS comments');
  const ids = [...svg.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
  for (const id of ids) if (!id.startsWith(`${name}-`)) fail(`id needs ${name}- prefix: ${id}`);
  if (new Set(ids).size !== ids.length) fail('duplicate ids');
  if (/(?:^|[\s;{"'])\b(?:backdrop-)?filter\s*[:=]/i.test(svg)) fail('unsupported filters');
  const paints =
    /(?:^|[\s;{"'])(?:background(?:-color)?|fill|stroke|stop-color|color)\s*(?:=\s*(["'])(.*?)\1|:\s*([^;"'<>}]*))/gis;
  for (const m of svg.matchAll(paints)) {
    const value = (m[2] ?? m[3]).trim();
    const paint = value.replace(/^url\(\s*#[\w.-]+\s*\)\s*/, '');
    if (
      !/^(?:none|transparent|inherit|currentcolor)$/i.test(paint) &&
      !(paint === '' && value.startsWith('url(')) &&
      !(/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(paint) && palette(paint, name))
    )
      fail(`palette: ${value}`);
  }
  return errors;
}
// Pixel centroid of bright mass: ignores dim sky; no semantic focal-object claim.
export function focal(pixels, width = 600) {
  let mass = 0,
    xsum = 0,
    ysum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const weight =
      (Math.max(0, (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255 - 0.45) *
        pixels[i + 3]) /
      255;
    mass += weight;
    xsum += weight * ((i / 4) % width);
    ysum += weight * Math.floor(i / 4 / width);
  }
  if (!mass) return 'focal: no luminance above 0.45';
  const x = xsum / mass,
    y = ysum / mass;
  return x >= 150 && x <= 450 && y >= 20 && y <= 130
    ? null
    : `focal: bright centroid (${x.toFixed(1)}, ${y.toFixed(1)}) outside x150..450 y20..130`;
}
export const unsafe = item =>
  inspect(item).some(e =>
    /^(?:forbidden element:|active or external|external reference:|fonts forbidden|unsupported|root svg required)/.test(
      e,
    ),
  );
export function parseResult(output, count) {
  const body = output.match(/<body>([\s\S]*?)<\/body>/)?.[1];
  if (!body || body.startsWith('pending')) throw new Error('renderer produced no result (timeout/budget)');
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    throw new Error('renderer produced malformed JSON');
  }
  if (!Array.isArray(result) || result.length !== count || result.some(r => r !== null && typeof r !== 'string'))
    throw new Error('renderer result shape/cardinality mismatch');
  return result;
}
export function render(items) {
  const browser =
    process.env.ART_BROWSER ||
    [
      process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
      process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
      process.env['PROGRAMFILES(X86)'] &&
        join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
    ].find(p => p && existsSync(p));
  if (!browser) throw new Error('Set ART_BROWSER to an installed Chromium executable for rendered focal checks.');
  const temp = mkdtempSync(join(tmpdir(), 'art-gate-'));
  try {
    const script = `const items=${JSON.stringify(items.map(i => Buffer.from(i.svg).toString('base64')))}; const focal=${focal.toString()}; const results=[]; for(const svg of items){const image=new Image();image.src='data:image/svg+xml;base64,'+svg;try{await image.decode();const c=document.createElement('canvas');c.width=600;c.height=300;const ctx=c.getContext('2d');ctx.drawImage(image,0,0,600,300);results.push(focal(ctx.getImageData(0,0,600,300).data));}catch{results.push('focal: rendering failed');}}document.body.textContent=JSON.stringify(results);`;
    const page = join(temp, 'render.html');
    writeFileSync(
      page,
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; img-src data:"><body>pending<script type="module">${script}</script>`,
    );
    const output = execFileSync(
      browser,
      [
        '--headless',
        '--no-first-run',
        '--disable-background-networking',
        '--disable-gpu',
        `--user-data-dir=${join(temp, 'profile')}`,
        '--virtual-time-budget=3000',
        '--dump-dom',
        pathToFileURL(page).href,
      ],
      { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, timeout: 15000, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return parseResult(output, items.length);
  } finally {
    rmSync(temp, { recursive: true, force: true, maxRetries: 3 });
  }
}
export const setBudget = items =>
  items.reduce((n, i) => n + Buffer.byteLength(i.svg), 0) > 180 * 1024 ? ['exceeds 180 KiB'] : [];
export function main() {
  const start = performance.now(),
    items = assets();
  let failed = false;
  const report = (name, errors) => {
    for (const error of errors.filter(Boolean)) {
      console.error(`${name}: ${error}`);
      failed = true;
    }
  };
  const total = items.reduce((n, i) => n + Buffer.byteLength(i.svg), 0);
  report('set', setBudget(items));
  for (const item of items) report(item.name, inspect(item));
  try {
    const safe = items.filter(item => !unsafe(item));
    const pixels = render(safe);
    safe.forEach((item, i) => report(item.name, [pixels[i]]));
  } catch (error) {
    report('renderer', [error.message]);
  }
  console.log(`${items.length} SVG(s), ${total} bytes, ${(performance.now() - start).toFixed(0)} ms`);
  process.exitCode = failed ? 1 : 0;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

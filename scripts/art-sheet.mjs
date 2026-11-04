import { readFileSync, writeFileSync } from 'node:fs';
import { assets, unsafe } from './art-lint.mjs';

const css = readFileSync('src/ui/theme.css', 'utf8');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const skipped = assets()
  .filter(unsafe)
  .map(item => item.name);
const frames = [];
for (const { name, svg } of assets().filter(item => !unsafe(item)))
  for (const width of [390, 1200])
    for (const theme of ['dark', 'light']) {
      const image = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      const page = `<!doctype html><html data-theme="${theme}"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:"><style>${css}</style><body><div id="app"><div class="scenes"><div class="scene" style="background-image:url(${image});opacity:var(--art)"></div></div><main><p class="para">A cold work-light marks the docking arm. Beyond the glass, the berth remains quiet.</p></main></div><p class="ui">Overlay readability stress sample (not current UI layout)</p><div style="position:relative"><div class="scenes"><div class="scene" style="background-image:url(${image});opacity:var(--art)"></div></div><main style="position:absolute;top:100px"><p class="para">A cold work-light marks the docking arm. Beyond the glass, the berth remains quiet.</p></main></div></body></html>`;
      frames.push(
        `<section><h2>${escape(name)} · ${width}px · ${theme}</h2><iframe title="${escape(name)} ${width} ${theme}" width="${width}" height="720" srcdoc="${escape(page)}"></iframe></section>`,
      );
    }
writeFileSync(
  'node_modules/art-contact-sheet.html',
  `<!doctype html><meta charset="utf-8"><title>Backdrop contact sheet</title><h1>Backdrop contact sheet</h1><p>Skipped unsafe SVGs: ${escape(skipped.join(', ') || 'none')}</p><p>Live isolated previews; actual theme.css, header mask, drift and body typography. Iframe viewport heights are 720px. Review both drift extremes and reduced motion separately.</p>${frames.join('\n')}`,
);
console.log('node_modules/art-contact-sheet.html');

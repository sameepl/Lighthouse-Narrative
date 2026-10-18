// Vanilla DOM renderer shared by the plain-JS and ink prototypes (React has its own components).
// Both adapters feed it the same "events" and "choices" shapes produced by engine.js.
import { story } from './story.js';

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const sign = n => (n >= 0 ? `+${n}` : `${n}`);
export const ICONS = {
  theme: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
  restart: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/></svg>',
};
const pips = (n, max, on, off) => on.repeat(n) + off.repeat(Math.max(0, max - n));

export function eventHtml(ev) {
  switch (ev.type) {
    case 'para': return `<p class="para${ev.speech ? ' speech' : ''}">${ev.html}</p>`;
    case 'pick': return `<div class="pick">▸ ${ev.html}</div>`;
    case 'roll': return `<div class="roll ${ev.grade}"><span>${ev.dice[0]} + ${ev.dice[1]} ${sign(ev.mod)} = <b>${ev.total}</b></span> · <b>${esc(ev.label)}</b>${ev.edge ? `<small>${esc(ev.edge)}</small>` : ''}</div>`;
    case 'note': return `<div class="note ${ev.kind}">${esc(ev.t)}</div>`;
    case 'summary': return `<section class="summary"><h3>What it bought, and what it cost</h3>${
      ev.items.length ? ev.items.map(i => `<p class="note ${i.kind}">${esc(i.t)}</p>`).join('') : '<p>Nothing was decided.</p>'}</section>`;
    default: return '';
  }
}

export function createUI(root, { onRestart, onPick }) {
  root.innerHTML = `
    <header class="hud"></header>
    <div class="scenes"><div class="scene" data-bg="hall"></div></div>
    <main></main>
    <div class="dock"><div class="odds" hidden></div><div class="choices"></div></div>
    <div class="sheet"><div class="in"></div></div>`;
  const $ = s => root.querySelector(s);
  const hud = $('.hud'), feed = $('main'), choicesEl = $('.choices'), oddsEl = $('.odds'), sheetEl = $('.sheet'), sheetIn = $('.sheet .in');
  let sheetData = null;

  const theme = () => { try { return localStorage.getItem('proto-theme'); } catch { return null; } };
  if (theme()) document.documentElement.dataset.theme = theme();

  hud.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.act === 'sheet') { renderSheet(); sheetEl.classList.add('open'); }
    if (b.dataset.act === 'theme') {
      const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('proto-theme', next); } catch {}
    }
    if (b.dataset.act === 'restart') onRestart();
  });
  sheetEl.addEventListener('click', e => { if (e.target === sheetEl || e.target.closest('.close')) sheetEl.classList.remove('open'); });

  function renderSheet() {
    if (!sheetData) return;
    sheetIn.innerHTML = `<button class="close">Close</button><h2>${esc(story.player.name)}</h2>
      <h2>Characteristics</h2><div class="grid">${sheetData.chars.map(c => `<div class="cell">${c.k}<span class="mono">${c.score} <small>(${sign(c.mod)})</small></span></div>`).join('')}</div>
      <h2>Skills</h2><div class="grid">${sheetData.skills.map(c => `<div class="cell">${esc(c.k)}<span class="mono">${c.lvl}</span></div>`).join('')}</div>
      <h2>Ledger</h2>${sheetData.ledger.length ? sheetData.ledger.map(i => `<p class="note ${i.kind}">${esc(i.t)}</p>`).join('') : '<p class="note">Nothing yet.</p>'}
      <p class="foot">Characteristic and skill values are placeholders for the prototype.</p>`;
  }

  return {
    setHud(h) {
      const low = h.Credits < h.reserve;
      hud.innerHTML = `
        <div class="stat"><span class="lab">Credits</span><span class="val ${low ? 'low' : 'ok'}">Cr ${h.Credits.toLocaleString('en-US')}</span></div>
        <div class="stat"><span class="lab">Edge</span><span class="val pip">${pips(h.Edge, h.max.Edge, '●', '○')}</span></div>
        <div class="stat"><span class="lab">Strain</span><span class="val pip">${pips(h.Strain, h.max.Strain, '▮', '▯')}</span></div>
        <span class="sp"></span>
        <button data-act="sheet" title="Character sheet">Sheet</button><button data-act="theme" title="Theme" aria-label="Toggle theme">${ICONS.theme}</button><button data-act="restart" title="Restart" aria-label="Restart">${ICONS.restart}</button>`;
    },
    setSheet(d) { sheetData = d; if (sheetEl.classList.contains('open')) renderSheet(); },
    setBg(b) { root.querySelectorAll('.scene').forEach(e => e.classList.toggle('on', e.dataset.bg === b)); },
    append(events) {
      let first = null;
      events.forEach((ev, i) => {
        feed.insertAdjacentHTML('beforeend', eventHtml(ev));
        first ??= feed.lastElementChild;
        feed.lastElementChild.style.animationDelay = `${Math.min(i * 0.2, 0.8)}s`;
      });
      first?.scrollIntoView({ block: 'start', behavior: 'smooth' }); // read from the start of the new text
    },
    setOdds(o) {
      oddsEl.hidden = !o;
      if (typeof o === 'string') oddsEl.innerHTML = o;
      else if (o) oddsEl.innerHTML = `Need <b>${o.target}+</b> on 2d6 · modifier <b>${sign(o.mod)}</b> (${o.parts.map(esc).join(', ')})<br>Success <b>${o.success}%</b> · Clean <b>${o.clean}%</b>`;
    },
    setChoices(list) {
      choicesEl.innerHTML = '';
      choicesEl.classList.toggle('row', list.length > 1 && list.every(c => ['try', 'odds', 'back'].includes(c.kind)));
      const all = list.length ? list : [{ id: 'restart', kind: 'restart', text: 'Play again' }];
      all.forEach(c => {
        const b = document.createElement('button');
        b.className = c.kind;
        b.innerHTML = esc(c.text) + (c.sub ? `<small>${esc(c.sub)}</small>` : '');
        b.onclick = () => (c.id === 'restart' ? onRestart() : onPick(c.id));
        choicesEl.append(b);
      });
    },
    clear() { feed.innerHTML = ''; },
    getFeed: () => feed.innerHTML,
    setFeed(html) { feed.innerHTML = html; },
  };
}

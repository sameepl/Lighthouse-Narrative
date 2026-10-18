import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import '@shared/ui.css';
import { story } from '@shared/story.js';
import { newState, view, choose, introEvents, sheet } from '@shared/engine.js';
import { ICONS } from '@shared/ui.js';

const SAVE = 'proto-react-v2';
const sign = n => (n >= 0 ? `+${n}` : `${n}`);
const pips = (n, max, on, off) => on.repeat(n) + off.repeat(Math.max(0, max - n));
const load = () => { try { return JSON.parse(localStorage.getItem(SAVE)); } catch { return null; } };
let uid = 0;
const tag = events => events.map((e, i) => ({ ...e, id: ++uid, d: Math.min(i * 0.2, 0.8) }));

function Event({ ev }) {
  const common = { 'data-ev': ev.id, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: ev.d ?? 0, duration: 0.5 } };
  switch (ev.type) {
    case 'para': return <motion.p className={`para${ev.speech ? ' speech' : ''}`} style={{ animation: 'none' }} {...common} dangerouslySetInnerHTML={{ __html: ev.html }} />;
    case 'pick': return <motion.div className="pick" style={{ animation: 'none' }} {...common}>▸ {ev.html}</motion.div>;
    case 'roll': return (
      <motion.div className={`roll ${ev.grade}`} style={{ animation: 'none' }} {...common}>
        <span>{ev.dice[0]} + {ev.dice[1]} {sign(ev.mod)} = <b>{ev.total}</b></span> · <b>{ev.label}</b>
        {ev.edge && <small>{ev.edge}</small>}
      </motion.div>);
    case 'note': return <motion.div className={`note ${ev.kind}`} style={{ animation: 'none' }} {...common}>{ev.t}</motion.div>;
    case 'summary': return (
      <motion.section className="summary" style={{ animation: 'none' }} {...common}>
        <h3>What it bought, and what it cost</h3>
        {ev.items.length ? ev.items.map((n, k) => <p key={k} className={`note ${n.kind}`}>{n.t}</p>) : <p>Nothing was decided.</p>}
      </motion.section>);
    default: return null;
  }
}

function Sheet({ data, onClose }) {
  return (
    <div className="sheet open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="in">
        <button className="close" onClick={onClose}>Close</button>
        <h2>{story.player.name}</h2>
        <h2>Characteristics</h2>
        <div className="grid">{data.chars.map(c => <div className="cell" key={c.k}>{c.k}<span className="mono">{c.score} <small>({sign(c.mod)})</small></span></div>)}</div>
        <h2>Skills</h2>
        <div className="grid">{data.skills.map(c => <div className="cell" key={c.k}>{c.k}<span className="mono">{c.lvl}</span></div>)}</div>
        <h2>Ledger</h2>
        {data.ledger.length ? data.ledger.map((n, k) => <p key={k} className={`note ${n.kind}`}>{n.t}</p>) : <p className="note">Nothing yet.</p>}
        <p className="foot">Characteristic and skill values are placeholders for the prototype.</p>
      </div>
    </div>);
}

function App() {
  const [saved] = useState(load);
  const [state, setState] = useState(() => saved?.state ?? newState());
  const [feed, setFeed] = useState(() => saved?.feed ?? tag(introEvents(state)));
  const [open, setOpen] = useState(false);
  const [scrollTo, setScrollTo] = useState(null);
  const v = view(state), h = v.hud;

  useEffect(() => { try { localStorage.setItem(SAVE, JSON.stringify({ state, feed })); } catch {} }, [state, feed]);
  useEffect(() => { if (scrollTo) document.querySelector(`[data-ev="${scrollTo}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, [scrollTo]);

  const pick = id => {
    const r = choose(state, id);
    const added = tag(r.events);
    setState(r.state);
    setFeed(f => [...f, ...added]);
    setScrollTo(added[0]?.id ?? null);
  };
  const restart = () => { const s = newState(); setState(s); setFeed(tag(introEvents(s))); };
  const toggleTheme = () => {
    const el = document.documentElement;
    const cur = el.dataset.theme || (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
    el.dataset.theme = cur === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('proto-theme', el.dataset.theme); } catch {}
  };
  const choices = v.choices.length ? v.choices : [{ id: 'restart', kind: 'restart', text: 'Play again' }];
  const row = choices.length > 1 && choices.every(c => ['try', 'odds', 'back'].includes(c.kind));

  return (
    <div id="app">
      <header className="hud">
        <div className="stat"><span className="lab">Credits</span><span className={`val ${h.Credits < h.reserve ? 'low' : 'ok'}`}>Cr {h.Credits.toLocaleString('en-US')}</span></div>
        <div className="stat"><span className="lab">Edge</span><span className="val pip">{pips(h.Edge, h.max.Edge, '●', '○')}</span></div>
        <div className="stat"><span className="lab">Strain</span><span className="val pip">{pips(h.Strain, h.max.Strain, '▮', '▯')}</span></div>
        <span className="sp" />
        <button onClick={() => setOpen(true)}>Sheet</button><button aria-label="Toggle theme" onClick={toggleTheme} dangerouslySetInnerHTML={{ __html: ICONS.theme }} /><button aria-label="Restart" onClick={restart} dangerouslySetInnerHTML={{ __html: ICONS.restart }} />
      </header>
      <div className="scenes">
        <motion.div className="scene" data-bg="hall" style={{ transition: 'none', animation: 'none' }}
          initial={false} animate={{ opacity: v.bg === 'hall' ? 'var(--art)' : 0, x: ['-1.5%', '1.5%'] }}
          transition={{ opacity: { duration: 1.4 }, x: { duration: 60, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }} />
      </div>
      <main>
        <AnimatePresence initial={false}>{feed.map(e => <Event key={e.id} ev={e} />)}</AnimatePresence>
      </main>
      <div className="dock">
        {v.odds && <div className="odds">Need <b>{v.odds.target}+</b> on 2d6 · modifier <b>{sign(v.odds.mod)}</b> ({v.odds.parts.join(', ')})<br />Success <b>{v.odds.success}%</b> · Clean <b>{v.odds.clean}%</b></div>}
        <div className={`choices${row ? ' row' : ''}`}>
          {choices.map(c => (
            <motion.button key={`${state.node}-${c.id}`} className={c.kind} whileTap={{ scale: 0.97 }}
              onClick={() => (c.id === 'restart' ? restart() : pick(c.id))}>
              {c.text}{c.sub && <small>{c.sub}</small>}
            </motion.button>))}
        </div>
      </div>
      {open && <Sheet data={sheet(state)} onClose={() => setOpen(false)} />}
    </div>);
}

try { const t = localStorage.getItem('proto-theme'); if (t) document.documentElement.dataset.theme = t; } catch {}
createRoot(document.getElementById('root')).render(<App />);

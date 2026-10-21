import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from 'zustand';
import { Hud } from './components/Hud';
import { Feed } from './components/Feed';
import { Dock } from './components/Dock';
import { SheetPanel } from './components/SheetPanel';
import { hubStatusText } from './strings';
import type { GameEvent } from '../bridge/types';
import { clearSave, startGame, writeSave } from './persist';

const THEME_KEY = 'lighthouse-narrative-theme';

function toggleTheme() {
  const el = document.documentElement;
  const cur = el.dataset['theme'] ?? (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  el.dataset['theme'] = cur === 'light' ? 'dark' : 'light';
  try {
    localStorage.setItem(THEME_KEY, el.dataset['theme']);
  } catch {
    /* ignore */
  }
}

export function App() {
  const session = useMemo(startGame, []);
  const view = useStore(session.store);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    writeSave(session);
  }, [session, view]);

  const events = useMemo<GameEvent[]>(
    () => [
      ...view.events,
      ...(view.hub ? [{ id: -1, type: 'para' as const, speech: false, html: hubStatusText(view.hub) }] : []),
    ],
    [view.events, view.hub],
  );

  const act = (id: number | string) => session.act(id);
  const restart = () => {
    clearSave();
    session.restart();
    window.scrollTo({ top: 0 });
  };

  return (
    <div id="app">
      <Hud res={view.res} onSheet={() => setSheetOpen(true)} onTheme={toggleTheme} onRestart={restart} />
      <div className="scenes">
        <motion.div
          className="scene"
          initial={false}
          animate={{ opacity: view.bg === 'hall' ? 'var(--art)' : 0, x: ['-1.5%', '1.5%'] }}
          transition={{
            opacity: { duration: 1.4 },
            x: { duration: 60, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
          }}
          style={{ animation: 'none', transition: 'none' }}
        />
      </div>
      <Feed events={events} />
      <Dock choices={view.choices} odds={view.odds} ended={view.ended} onAct={act} onRestart={restart} />
      {sheetOpen && <SheetPanel ledger={view.ledger} onClose={() => setSheetOpen(false)} />}
    </div>
  );
}

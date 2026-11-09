import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { Hud } from './components/Hud';
import { Feed } from './components/Feed';
import { Dock } from './components/Dock';
import { Board } from './components/Board';
import { Background } from './components/Background';
import { Prepare } from './components/Prepare';
import { SheetPanel } from './components/SheetPanel';
import { hubStatusText } from './strings';
import type { GameEvent } from '../bridge/types';
import { clearSave, continueGame, newGame, readSavedGame, writeSave } from './persist';
import { Title } from './components/Title';
import { Hint } from './components/Hint';
import { timing, exportTiming } from './timing';
import { timingExportLabel } from './strings';
import { cycleReport, acknowledgedCycle, acknowledgeCycle } from './downtime';
import { Downtime } from './components/Downtime';

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
  const [saved] = useState(readSavedGame);
  const [session, setSession] = useState<ReturnType<typeof newGame> | null>(null);
  if (!session)
    return (
      <Title
        canContinue={saved !== null}
        onStart={() => setSession(newGame())}
        onContinue={() => setSession(saved ? continueGame(saved) : null)}
        onTheme={toggleTheme}
      />
    );
  return <ActiveGame session={session} />;
}

function ActiveGame({ session }: { session: ReturnType<typeof newGame> }) {
  const view = useStore(session.store);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(() =>
    acknowledgedCycle(view.cycle.pursuit.length, view.cycle.cycle),
  );
  const [settlementError, setSettlementError] = useState(false);
  const settlementAttempt = useRef<number | null>(null);
  const report = cycleReport(view);
  const restoredReport = useRef(report !== null && acknowledged < report.nextCycle);
  const boardFocus = useRef<HTMLDivElement>(null);
  const [focusBoard, setFocusBoard] = useState(false);
  useEffect(() => {
    if (focusBoard) {
      boardFocus.current?.querySelector<HTMLElement>('h2')?.focus();
      setFocusBoard(false);
    }
  }, [focusBoard]);
  const exhausted = view.phase === 'hub' && view.cycle.actionsLeft === 0 && view.choices.some(c => c.id === 'endCycle');
  const between = exhausted || (report !== null && acknowledged < report.nextCycle);
  const settle = () => {
    setSettlementError(false);
    settlementAttempt.current = session.store.getState().cycle.cycle;
    try {
      session.act('endCycle');
    } catch {
      setSettlementError(true);
    }
  };
  useEffect(() => {
    const current = session.store.getState();
    if (
      !settlementError &&
      current.phase === 'hub' &&
      current.cycle.actionsLeft === 0 &&
      settlementAttempt.current !== current.cycle.cycle &&
      current.choices.some(c => c.id === 'endCycle')
    ) {
      settlementAttempt.current = current.cycle.cycle;
      try {
        session.act('endCycle');
      } catch {
        setSettlementError(true);
      }
    }
  }, [session, view, settlementError]);

  useEffect(() => {
    writeSave(session);
  }, [session, view]);

  const events = useMemo<GameEvent[]>(
    () => [
      ...view.events.slice(
        0,
        between && report
          ? view.events.map(e => e.type === 'note' && e.command?.code === 'upkeepSettlement').lastIndexOf(true)
          : undefined,
      ),
      ...(!between && view.hub && view.hub.board !== 'ready'
        ? [{ id: -1, type: 'para' as const, speech: false, html: hubStatusText(view.hub) }]
        : []),
    ],
    [view.events, view.hub, between, report],
  );

  const act = (id: number | string) => session.act(id);
  const showBoard = !between && view.phase === 'hub' && view.hub !== null;
  const showPrepare = view.phase === 'prepare' && view.preparation !== null && view.active !== null;
  const dockChoices = view.choices.filter(
    choice =>
      !(showBoard && choice.command?.code === 'offer') &&
      !(showPrepare && (choice.command?.code === 'ship' || choice.command?.code === 'crew')),
  );
  const restart = () => {
    clearSave();
    restoredReport.current = false;
    settlementAttempt.current = null;
    setAcknowledged(0);
    setSettlementError(false);
    session.restart();
    window.scrollTo({ top: 0 });
  };

  return (
    <div id="app">
      <Hud
        res={view.res}
        pursuit={view.cycle.pursuit}
        onSheet={() => setSheetOpen(true)}
        onTheme={toggleTheme}
        onRestart={restart}
      />
      <Background name={view.bg} />
      {timing && <button onClick={exportTiming}>{timingExportLabel}</button>}
      <Feed events={events} />
      {between && (
        <Downtime
          report={report}
          error={settlementError}
          onRetry={settle}
          focus={restoredReport.current}
          onStart={() => {
            restoredReport.current = false;
            acknowledgeCycle(view.cycle.pursuit.length, view.cycle.cycle);
            setAcknowledged(view.cycle.cycle);
            setFocusBoard(true);
          }}
        />
      )}
      {showBoard && <Hint id="board" />}
      {showPrepare && <Hint id="prepare" />}
      {view.odds && <Hint id="odds" />}
      {view.choices.some(choice => choice.kind === 'edge') && <Hint id="edge" />}
      {showBoard && (
        <div ref={boardFocus}>
          <Board offers={view.offers} offerLocks={view.offerLocks} cycle={view.cycle} onAct={act} />
        </div>
      )}
      {showPrepare && (
        <Prepare active={view.active} preparation={view.preparation} choices={view.choices} onAct={act} />
      )}
      {!between && <Dock choices={dockChoices} odds={view.odds} ended={view.ended} onAct={act} onRestart={restart} />}
      {sheetOpen && <SheetPanel ledger={view.ledger} onClose={() => setSheetOpen(false)} />}
    </div>
  );
}

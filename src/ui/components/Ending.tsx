import { useEffect, useRef } from 'react';
import type { GameView } from '../../bridge/types';
import { downtimeBalances, endingCopy, evidenceText, noteText } from '../strings';

type Props = { view: GameView; restored?: boolean; onRestart: () => void };
export function Ending({ view, restored = false, onRestart }: Props) {
  const title = view.cycle.failed
    ? endingCopy.foreclosure
    : view.bg === 'end_open' || view.bg === 'end_closed'
      ? endingCopy[view.bg]
      : endingCopy.unknown;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (restored) heading.current?.scrollIntoView({ block: 'start' });
  }, [restored]);
  return (
    <section className="ending" aria-labelledby="ending-title">
      <h1 id="ending-title" tabIndex={-1} ref={heading}>
        {title}
      </h1>
      <h2>{endingCopy.balances}</h2>
      <p className="mono">{downtimeBalances(view.res, view.cycle.pursuit)}</p>
      <h2>{endingCopy.pieces}</h2>
      {view.evidence.length ? (
        <ul>
          {view.evidence.map(piece => (
            <li key={piece.id}>{evidenceText(piece)}</li>
          ))}
        </ul>
      ) : (
        <p>{endingCopy.noPieces}</p>
      )}
      {(['gain', 'cost', 'watch'] as const).map(kind => {
        const notes = view.ledger.filter(note => note.kind === kind);
        return (
          <details key={kind}>
            <summary>
              {kind === 'gain' ? endingCopy.gains : kind === 'cost' ? endingCopy.costs : endingCopy.watch} (
              {notes.length})
            </summary>
            {notes.length ? (
              notes.map((note, i) => (
                <p className={`note ${kind}`} key={i}>
                  {noteText(note)}
                </p>
              ))
            ) : (
              <p>{endingCopy.empty}</p>
            )}
          </details>
        );
      })}
      <button onClick={onRestart}>{endingCopy.restart}</button>
    </section>
  );
}

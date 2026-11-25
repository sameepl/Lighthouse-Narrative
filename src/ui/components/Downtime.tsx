import { useEffect, useRef } from 'react';
import type { CycleReport } from '../downtime';
import { downtimeCopy, downtimeTitle, downtimeBalances, downtimeNext, upkeepText, noteText } from '../strings';

export function Downtime({
  report,
  onStart,
  error,
  onRetry,
  focus,
}: {
  report: CycleReport | null;
  onStart: () => void;
  error: boolean;
  onRetry: () => void;
  focus: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) heading.current?.focus();
  }, [focus]);
  return (
    <section className="downtime" aria-labelledby="downtime-title">
      <h1 id="downtime-title" tabIndex={-1} ref={heading} aria-live="polite" aria-atomic="true">
        {report ? downtimeTitle(report.cycle) : downtimeCopy.settling}
      </h1>
      {report ? (
        <>
          <p>{upkeepText(report.upkeep)}</p>
          <p className="mono">{downtimeBalances(report.resources, report.pursuit)}</p>
          {report.upkeep.arrearsAfter > 0 && <p className="note cost">{downtimeCopy.arrears}</p>}
          <h2>{downtimeCopy.ledger}</h2>
          {report.ledger
            .filter(note => note.command?.code !== 'upkeepSettlement')
            .map((note, i) => (
              <p className={`note ${note.kind}`} key={i}>
                {noteText(note)}
              </p>
            ))}
          {!report.ledger.some(note => note.command?.code !== 'upkeepSettlement') && <p>{downtimeCopy.empty}</p>}
          <button onClick={onStart}>{downtimeNext(report.nextCycle)}</button>
        </>
      ) : (
        <p role={error ? 'alert' : 'status'}>
          {error ? downtimeCopy.error : downtimeCopy.settling}
          {error && <button onClick={onRetry}>{downtimeCopy.retry}</button>}
        </p>
      )}
    </section>
  );
}

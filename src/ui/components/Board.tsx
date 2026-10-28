import type { GameView } from '../../bridge/types';
import { boardLabels as labels, boardLockText } from './Board.labels';

type Props = Pick<GameView, 'offers' | 'offerLocks' | 'cycle'> & {
  onAct: (id: number | string) => void;
};

export function Board({ offers, offerLocks, cycle, onAct }: Props) {
  return (
    <section className="board" aria-label={labels.title}>
      <div className="board-heading">
        <h2>{labels.cycle(cycle.cycle)}</h2>
        <span>{labels.actions(cycle.actionsLeft)}</span>
      </div>
      <div className="board-offers">
        {offers.map(offer => {
          const reasons = offerLocks.find(lock => lock.offerId === offer.entry.id)?.reasons ?? [];
          const badge = offer.kind === 'encounter' ? labels.layers[offer.entry.layer] : labels.keystone;
          return (
            <button
              type="button"
              className={`board-card${reasons.length ? ' board-card-locked' : ''}`}
              key={offer.entry.id}
              onClick={() => onAct(`offer:${offer.entry.id}`)}
            >
              <span className="board-kind">
                <span aria-hidden="true">{badge.icon}</span> {badge.text}
                {offer.forced && <span> · {labels.forced}</span>}
                {offer.weak && <span> · {labels.weak}</span>}
              </span>
              <strong className="board-title">{offer.entry.title}</strong>
              <span className="board-detail">
                {offer.kind === 'encounter' ? labels.cost(offer.entry.cost) : labels.unlistedCost}
              </span>
              <span className="board-detail">
                {offer.kind === 'encounter' ? labels.risk(offer.entry.risk) : labels.unlistedRisk}
              </span>
              {reasons.length > 0 && (
                <span className="board-lock">
                  <b>{labels.locked}: </b>
                  {reasons.map(boardLockText).join(' ')}
                  {reasons.some(reason => reason.code === 'insufficientCredits') && ` ${labels.prepare}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

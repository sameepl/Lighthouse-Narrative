import type { GameView } from '../../bridge/types';
import { boardLabels, boardLockText } from './Board.labels';
import { prepareLabels as labels, crewStatus } from './Prepare.labels';

type Props = Pick<GameView, 'active' | 'preparation' | 'choices'> & {
  onAct: (id: number | string) => void;
};

export function Prepare({ active, preparation, choices, onAct }: Props) {
  if (!active || !preparation) return null;
  const { ships, crew, shipRequirement, reasons, ready } = preparation;
  return (
    <section className="prepare" aria-label={labels.title}>
      <h2>
        {labels.title}: {active.entry.title}
      </h2>
      <p>{active.kind === 'encounter' ? boardLabels.cost(active.entry.cost) : boardLabels.unlistedCost}</p>
      <h3>{labels.ships}</h3>
      <p>
        {shipRequirement.kind === 'required'
          ? labels.required(shipRequirement.tag)
          : ships.some(ship => ship.selected)
            ? labels.optionalSelected
            : labels.optional}
      </p>
      <div className="prepare-options">
        {ships.map(ship => {
          const action = choices.find(c => c.command?.code === 'ship' && c.command.shipId === ship.shipId);
          return (
            <button
              type="button"
              key={ship.shipId}
              aria-pressed={ship.selected}
              disabled={!action}
              onClick={() => action && onAct(action.id)}
            >
              <strong>
                {ship.name}
                {ship.selected && ` · ${labels.selected}`}
              </strong>
              <span>{ship.tags.join(', ')}</span>
              <span>{labels.upkeep(ship.upkeep)}</span>
            </button>
          );
        })}
      </div>
      <h3>{labels.crew}</h3>
      <div className="prepare-options">
        {crew.map(member => {
          const action = choices.find(c => c.command?.code === 'crew' && c.command.crewId === member.crewId);
          const available = !!action && member.assignable && !member.busy;
          return (
            <button
              type="button"
              key={member.crewId}
              aria-pressed={member.assigned}
              disabled={!available}
              onClick={() => available && onAct(action!.id)}
            >
              <strong>{member.name}</strong>
              <span>
                {labels.assist(member.assist.skill, member.assist.n)} · {labels.trust(member.trust)}
              </span>
              <span>{labels.trait(member.trait)}</span>
              <span>{crewStatus(member, !!action)}</span>
            </button>
          );
        })}
      </div>
      <div className="prepare-status" role="status">
        {ready ? (
          labels.ready
        ) : (
          <>
            <b>{labels.blocked}</b>
            <ul>
              {reasons.map((reason, i) => (
                <li key={i}>{boardLockText(reason)}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

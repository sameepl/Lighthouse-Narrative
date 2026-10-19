import { motion } from 'framer-motion';
import type { UIChoice } from '../../bridge/types';
import { signed } from '../../engine/rules';
import type { OddsInfo } from '../../engine/types';

interface Props {
  choices: UIChoice[];
  odds: OddsInfo | null;
  ended: boolean;
  onAct: (id: number | string) => void;
  onRestart: () => void;
}

export function Dock({ choices, odds, ended, onAct, onRestart }: Props) {
  const list: UIChoice[] = ended ? [{ id: 'restart', kind: 'choice', text: 'Play again' }] : choices;
  const row = list.length > 1 && list.every(c => c.kind === 'try' || c.kind === 'odds' || c.kind === 'back');
  return (
    <div className="dock">
      {odds && (
        <div className="odds-panel">
          Need <b>{odds.target}+</b> on 2d6 · modifier <b>{signed(odds.mod)}</b> ({odds.parts.join(', ')})<br />
          Success <b>{odds.success}%</b> · Clean <b>{odds.clean}%</b>
        </div>
      )}
      <div className={`choices${row ? ' row' : ''}`}>
        {list.map(c => (
          <motion.button
            key={`${c.kind}-${c.id}-${c.text}`}
            className={c.kind}
            whileTap={{ scale: 0.97 }}
            onClick={() => (c.id === 'restart' ? onRestart() : onAct(c.id))}
          >
            {c.text}
            {c.sub && <small>{c.sub}</small>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

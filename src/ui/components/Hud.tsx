import { data } from '../../data';
import { ThemeIcon, RestartIcon } from '../icons';
import './Hud.css';

const LABELS = {
  Credits: 'Credits',
  Edge: 'Edge',
  Strain: 'Strain',
  Renown: 'Renown',
  Pursuit: 'Pursuit',
  Sheet: 'Sheet',
  Theme: 'Toggle theme',
  Restart: 'Restart',
  LowCredits: 'Below the emergency reserve',
} as const;

interface Props {
  res: Record<string, number>;
  pursuit: { value: number; length: number };
  onSheet: () => void;
  onTheme: () => void;
  onRestart: () => void;
}

export function Hud({ res, pursuit, onSheet, onTheme, onRestart }: Props) {
  const { Credits, Edge, Strain, Renown } = data.rules.resources;
  const credits = res.Credits ?? 0;
  const edge = res.Edge ?? 0;
  const strain = res.Strain ?? 0;
  const renown = res.Renown ?? 0;
  const low = credits < (Credits?.reserve ?? 0);

  const edgeMax = Edge?.max ?? 0;
  const strainMax = Strain?.max ?? 0;
  const renownMax = Renown?.max ?? 0;

  const pips = (n: number, max: number, on: string, off: string) => on.repeat(n) + off.repeat(Math.max(0, max - n));

  return (
    <header className="hud">
      <div className="hud-row hud-row-meters">
        <div className="stat">
          <span className="lab">{LABELS.Credits}</span>
          <span
            className={`val ${low ? 'low' : 'ok'}`}
            role="img"
            aria-label={`${LABELS.Credits} ${credits.toLocaleString('en-US')}${low ? `, ${LABELS.LowCredits}` : ''}`}
          >
            Cr {credits.toLocaleString('en-US')}
            {low && (
              <span className="warn" aria-hidden="true">
                !
              </span>
            )}
          </span>
        </div>
        <div className="stat">
          <span className="lab">{LABELS.Edge}</span>
          <span className="val pip" role="img" aria-label={`${LABELS.Edge} ${edge} of ${edgeMax}`}>
            <span aria-hidden="true">{pips(edge, edgeMax, '●', '○')}</span>
          </span>
        </div>
        <div className="stat">
          <span className="lab">{LABELS.Strain}</span>
          <span className="val pip" role="img" aria-label={`${LABELS.Strain} ${strain} of ${strainMax}`}>
            <span aria-hidden="true">{pips(strain, strainMax, '▮', '▯')}</span>
          </span>
        </div>
        <div className="stat">
          <span className="lab">{LABELS.Renown}</span>
          <span className="val pip" role="img" aria-label={`${LABELS.Renown} ${renown} of ${renownMax}`}>
            <span aria-hidden="true">{pips(renown, renownMax, '●', '○')}</span>
          </span>
        </div>
      </div>
      <div className="hud-row hud-row-controls">
        <div className="stat">
          <span className="lab">{LABELS.Pursuit}</span>
          <span className="val pip" role="img" aria-label={`${LABELS.Pursuit} ${pursuit.value} of ${pursuit.length}`}>
            <span aria-hidden="true">{pips(pursuit.value, pursuit.length, '●', '○')}</span>
          </span>
        </div>
        <span className="sp" />
        <button onClick={onSheet}>{LABELS.Sheet}</button>
        <button aria-label={LABELS.Theme} onClick={onTheme}>
          <ThemeIcon />
        </button>
        <button aria-label={LABELS.Restart} onClick={onRestart}>
          <RestartIcon />
        </button>
      </div>
    </header>
  );
}

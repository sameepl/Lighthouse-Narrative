import { data } from '../../data';
import { ThemeIcon, RestartIcon } from '../icons';

const pips = (n: number, max: number, on: string, off: string) => on.repeat(n) + off.repeat(Math.max(0, max - n));

interface Props { res: Record<string, number>; onSheet: () => void; onTheme: () => void; onRestart: () => void }

export function Hud({ res, onSheet, onTheme, onRestart }: Props) {
  const { Credits, Edge, Strain } = data.rules.resources;
  const credits = res.Credits ?? 0, edge = res.Edge ?? 0, strain = res.Strain ?? 0;
  const low = credits < (Credits?.reserve ?? 0);
  return (
    <header className="hud">
      <div className="stat"><span className="lab">Credits</span>
        <span className={`val ${low ? 'low' : 'ok'}`} title={low ? 'Below the emergency reserve' : undefined}>Cr {credits.toLocaleString('en-US')}</span></div>
      <div className="stat"><span className="lab">Edge</span><span className="val pip">{pips(edge, Edge?.max ?? 0, '●', '○')}</span></div>
      <div className="stat"><span className="lab">Strain</span><span className="val pip">{pips(strain, Strain?.max ?? 0, '▮', '▯')}</span></div>
      <span className="sp" />
      <button onClick={onSheet}>Sheet</button>
      <button aria-label="Toggle theme" onClick={onTheme}><ThemeIcon /></button>
      <button aria-label="Restart" onClick={onRestart}><RestartIcon /></button>
    </header>
  );
}

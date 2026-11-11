import { useEffect, useRef } from 'react';
import { data } from '../../data';
import { charMod, signed } from '../../engine/rules';
import type { LedgerNote } from '../../bridge/types';
import { noteText } from '../strings';

export function SheetPanel({ ledger, onClose }: { ledger: LedgerNote[]; onClose: () => void }) {
  const { character, rules, crew, ships } = data;
  const modal = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = modal.current!;
    const opener = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      opener?.focus();
    };
  }, []);
  return (
    <dialog
      ref={modal}
      className="sheet open"
      aria-labelledby="sheet-title"
      onKeyDown={e => {
        if (e.key !== 'Tab') return;
        const controls = [
          ...e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'),
        ];
        const first = controls[0],
          last = controls.at(-1);
        if ((e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last)) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      }}
      onCancel={e => {
        e.preventDefault();
        onClose();
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="in">
        <button className="close" onClick={onClose}>
          Close
        </button>
        <h2 id="sheet-title">{character.name}</h2>
        <h2>Characteristics</h2>
        <div className="grid">
          {Object.entries(character.chars).map(([k, v]) => (
            <div className="cell" key={k}>
              {k}
              <span className="mono">
                {v} <small>({signed(charMod(v, rules))})</small>
              </span>
            </div>
          ))}
        </div>
        <h2>Skills</h2>
        <div className="grid">
          {Object.entries(character.skills).map(([k, lvl]) => (
            <div className="cell" key={k}>
              {k}
              <span className="mono">{lvl}</span>
            </div>
          ))}
        </div>
        <h2>Ships</h2>
        {ships.map(s => (
          <p className="note" key={s.id}>
            <b>
              <i>{s.name}</i>
            </b>
            {s.main ? ' (main)' : ''}. {s.role}
          </p>
        ))}
        <h2>People</h2>
        {crew.map(c => (
          <p className="note" key={c.id}>
            <b>{c.name}</b>. {c.role}
          </p>
        ))}
        <h2>Ledger</h2>
        {ledger.length ? (
          ledger.map((n, i) => (
            <p key={i} className={`note ${n.kind}`}>
              {noteText(n)}
            </p>
          ))
        ) : (
          <p className="note">Nothing yet.</p>
        )}
        {character.placeholder && <p className="foot">Characteristic and skill values are placeholders.</p>}
      </div>
    </dialog>
  );
}

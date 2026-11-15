import { useEffect, useState } from 'react';
import { hintSeen, markHintSeen, type HintId } from '../onboarding';
import { onboarding } from '../strings';

export function Hint({ id, text }: { id: HintId; text?: string }) {
  const [visible, setVisible] = useState(() => !hintSeen(id));
  useEffect(() => {
    markHintSeen(id);
  }, [id]);
  return visible ? (
    <aside className="onboarding-hint" aria-label={id}>
      <p>{text ?? onboarding.hints[id]}</p>
      <button onClick={() => setVisible(false)}>{onboarding.dismiss}</button>
    </aside>
  ) : null;
}

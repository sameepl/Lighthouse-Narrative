import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/bridge/session';
import type { GameView } from '../src/bridge/types';
import { storyData } from './helpers';
import inkJson from '../src/story/main.ink';
import { Prepare } from '../src/ui/components/Prepare';

const render = (view: Pick<GameView, 'active' | 'preparation' | 'choices'>) =>
  renderToStaticMarkup(createElement(Prepare, { ...view, onAct: () => {} }));
const session = () => {
  const s = new GameSession({ inkJson, data: storyData });
  s.pickOffer('written_clause');
  return s;
};

describe('Prepare projection rendering', () => {
  it('shows optional ship, upkeep and effective crew facts before committing', () => {
    const s = session();
    const v = s.store.getState();
    const member = v.preparation!.crew.find(c => c.crewId === 'priya')!;
    member.assist.n = 7; // Deliberately distinct from the trust-derived value: render the projection.
    const html = render(v);
    for (const text of [
      'The Written Clause',
      'Cost Cr0',
      'No ship is selected',
      'Upkeep Cr1000 per cycle',
      '+7 Diplomat assist',
      'Trust 0',
      'Trait: fine print',
      'Unavailable for assignment',
      'Ready to confirm',
    ])
      expect(html).toContain(text);
    expect(html).not.toMatch(/Success|Clean|Odds/);
    expect(s.save().run.assignments).toEqual({ shipId: null, crewIds: [] });
    expect(render({ ...v, preparation: null })).toBe('');
  });

  it('reflects selected assignments and disables unavailable commands without hiding crew', () => {
    const s = session();
    s.act('ship:errant_pawn');
    s.act('crew:priya');
    const v = s.store.getState();
    let html = render(v);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(2);
    expect(html).toContain('Assigned; busy after confirmation this cycle');
    expect(html).toContain('Cancel and reopen this offer to reset assignments.');
    v.preparation!.crew.find(c => c.crewId === 'priya')!.busy = true;
    v.choices = v.choices.filter(c => c.command?.code !== 'ship');
    html = render(v);
    expect(html).toContain('Busy this cycle');
    expect(html).toMatch(/aria-pressed="true" disabled=""/);
    expect(html.match(/<button\b/g)).toHaveLength(v.preparation!.ships.length + v.preparation!.crew.length);
    s.act('cancel');
    expect(s.store.getState().phase).toBe('hub');
    expect(s.save().run.assignments).toEqual({ shipId: null, crewIds: [] });
  });

  it('shows required ship and exact blocking reasons supplied by the bridge', () => {
    const v = session().store.getState();
    v.preparation!.shipRequirement = { kind: 'required', tag: 'workshop' };
    v.preparation!.ready = false;
    v.preparation!.reasons = [
      { code: 'requiredShip', shipTag: 'workshop' },
      { code: 'requiredCrew', crewId: 'priya' },
      { code: 'insufficientCredits', required: 71, available: 2 },
    ];
    const html = render(v);
    for (const text of [
      'Requires a ship tagged workshop.',
      'Requires crew: priya.',
      'Requires Cr71; Cr2 available.',
      'Before confirming:',
    ])
      expect(html).toContain(text);
    expect(html).not.toContain('Ready to confirm');
  });
});

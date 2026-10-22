import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { GameEvent } from '../../bridge/types';
import { signed } from '../../engine/rules';
import { noteText } from '../strings';

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

/** Dice that tumble for a moment before settling, for rolls made this session. */
function Dice({ dice, tumble }: { dice: [number, number]; tumble: boolean }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<[number, number]>(tumble && !reduce ? [1, 1] : dice);
  useEffect(() => {
    if (!tumble || reduce) return;
    const t = setInterval(() => setShown([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]), 70);
    const done = setTimeout(() => {
      clearInterval(t);
      setShown(dice);
    }, 550);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [dice, tumble, reduce]);
  return (
    <>
      {shown[0]} + {shown[1]}
    </>
  );
}

function EventView({ ev, delay, fresh }: { ev: GameEvent; delay: number; fresh: boolean }) {
  const common = {
    'data-ev': ev.id,
    ...rise(fresh ? delay : 0),
    initial: fresh ? { opacity: 0, y: 8 } : false,
  } as const;
  switch (ev.type) {
    case 'para':
      return (
        <motion.p
          className={`para${ev.speech ? ' speech' : ''}`}
          {...common}
          dangerouslySetInnerHTML={{ __html: ev.html }}
        />
      );
    case 'pick':
      return (
        <motion.div className="pick" {...common}>
          ▸ {ev.html}
        </motion.div>
      );
    case 'roll':
      return (
        <motion.div className={`roll ${ev.grade}`} {...common}>
          <span>
            <Dice dice={ev.dice} tumble={fresh} /> {signed(ev.mod)} = <b>{ev.total}</b>
          </span>{' '}
          · <b>{ev.label}</b>
          {ev.edge && <small>{ev.edge}</small>}
        </motion.div>
      );
    case 'note':
      return (
        <motion.div className={`note ${ev.kind}`} {...common}>
          {noteText(ev)}
        </motion.div>
      );
    case 'summary':
      return (
        <motion.section className="summary" {...common}>
          <h3>What it bought, and what it cost</h3>
          {ev.items.length ? (
            ev.items.map((n, i) => (
              <p key={i} className={`note ${n.kind}`}>
                {noteText(n)}
              </p>
            ))
          ) : (
            <p>Nothing was decided.</p>
          )}
        </motion.section>
      );
  }
}

export function Feed({ events }: { events: GameEvent[] }) {
  // Events present at first render were restored from a save: show them without animating.
  const initial = useRef(new Set(events.map(e => e.id)));
  const lastId = useRef(events.at(-1)?.id ?? 0);

  // After a choice, scroll so the first new event sits under the header: read from the start of the new text.
  useEffect(() => {
    const newest = events.at(-1)?.id ?? 0;
    if (newest > lastId.current) {
      const first = events.find(e => e.id > lastId.current);
      if (first)
        document.querySelector(`[data-ev="${first.id}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    lastId.current = newest;
  }, [events]);

  let batchIndex = 0,
    prev = 0;
  return (
    <main>
      <AnimatePresence initial={false}>
        {events.map(ev => {
          batchIndex = ev.id === prev + 1 ? batchIndex + 1 : 0;
          prev = ev.id;
          return (
            <EventView
              key={ev.id}
              ev={ev}
              fresh={!initial.current.has(ev.id)}
              delay={Math.min(batchIndex * 0.2, 0.8)}
            />
          );
        })}
      </AnimatePresence>
    </main>
  );
}

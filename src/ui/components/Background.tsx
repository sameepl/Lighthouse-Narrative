import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { requestBackground } from '../backgrounds';

export function Background({ name }: { name: string }) {
  const [url, setUrl] = useState<string>();
  const reduce = useReducedMotion();
  useEffect(() => requestBackground(name, setUrl), [name]);

  return (
    <div className="scenes" aria-hidden="true">
      <AnimatePresence>
        {url && (
          <motion.div
            key={url}
            className="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 'var(--art)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 1.4 }}
            style={{ backgroundImage: `url(${JSON.stringify(url)})` }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

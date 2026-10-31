export type BackgroundRegistry = Readonly<Record<string, () => Promise<{ default: string }>>>;

export const backgrounds: BackgroundRegistry = {
  hall: () => import('./assets/hall.svg?url'),
};

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Background image failed to load'));
    image.src = url;
  });
}

/** Leave the current backdrop alone until a registered image is ready. */
export function requestBackground(
  name: string,
  onReady: (url: string) => void,
  registry = backgrounds,
  preload = preloadImage,
): () => void {
  let cancelled = false;
  if (Object.hasOwn(registry, name)) {
    void (async () => {
      try {
        const asset = await registry[name]!();
        if (cancelled) return;
        await preload(asset.default);
        if (!cancelled) onReady(asset.default);
      } catch {
        // Missing chunks and failed images retain the last successful backdrop.
      }
    })();
  }
  return () => {
    cancelled = true;
  };
}

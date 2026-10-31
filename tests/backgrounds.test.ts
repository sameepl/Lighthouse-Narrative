import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { backgrounds, requestBackground, type BackgroundRegistry } from '../src/ui/backgrounds';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('background loading', () => {
  it('only loads the requested asset and waits for the image before replacing the backdrop', async () => {
    const ready = vi.fn();
    const image = deferred<void>();
    const preload = vi.fn(() => image.promise);
    const registry = {
      first: vi.fn(async () => ({ default: '/first.svg' })),
      second: vi.fn(async () => ({ default: '/second.svg' })),
    };
    expect(registry.first).not.toHaveBeenCalled();
    requestBackground('first', ready, registry, preload);
    await flush();
    expect(registry.first).toHaveBeenCalledOnce();
    expect(registry.second).not.toHaveBeenCalled();
    expect(preload).toHaveBeenCalledWith('/first.svg');
    expect(ready).not.toHaveBeenCalled();
    image.resolve();
    await flush();
    expect(ready).toHaveBeenCalledExactlyOnceWith('/first.svg');
  });

  it('retains the last successful backdrop for unknown names or failed loads', async () => {
    let shown = '/previous.svg';
    const ready = (url: string) => {
      shown = url;
    };
    const registry: BackgroundRegistry = {
      chunkFailure: async () => {
        throw new Error('chunk unavailable');
      },
      imageFailure: async () => ({ default: '/broken.svg' }),
    };
    const preload = vi.fn(async () => {
      throw new Error('image unavailable');
    });
    for (const name of ['unknown', 'toString', '__proto__', 'chunkFailure', 'imageFailure']) {
      requestBackground(name, ready, registry, preload);
      await flush();
      expect(shown).toBe('/previous.svg');
    }
    expect(preload).toHaveBeenCalledExactlyOnceWith('/broken.svg');
  });

  it('ignores obsolete imports and image loads after a newer request or unmount', async () => {
    const oldImport = deferred<{ default: string }>();
    const oldImage = deferred<void>();
    const ready = vi.fn();
    const preload = vi.fn((url: string) => (url === '/slow-image.svg' ? oldImage.promise : Promise.resolve()));
    const registry = {
      import: () => oldImport.promise,
      image: async () => ({ default: '/slow-image.svg' }),
      newest: async () => ({ default: '/newest.svg' }),
    };
    const cancelImport = requestBackground('import', ready, registry, preload);
    cancelImport();
    const cancelImage = requestBackground('image', ready, registry, preload);
    await flush();
    cancelImage();
    requestBackground('newest', ready, registry, preload);
    await flush();
    oldImport.resolve({ default: '/obsolete.svg' });
    oldImage.resolve();
    await flush();
    expect(ready).toHaveBeenCalledExactlyOnceWith('/newest.svg');
    expect(preload).not.toHaveBeenCalledWith('/obsolete.svg');
  });

  it('cancels a pending image when the next name is unknown', async () => {
    const image = deferred<void>();
    const ready = vi.fn();
    const cancel = requestBackground(
      'pending',
      ready,
      { pending: async () => ({ default: '/pending.svg' }) },
      () => image.promise,
    );
    await flush();
    cancel();
    requestBackground('unknown', ready, {});
    image.resolve();
    await flush();
    expect(ready).not.toHaveBeenCalled();
  });
});

describe('story backdrop registry', () => {
  it('has a loadable SVG for every background tag in the story', async () => {
    const files = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const path = join(dir, entry.name);
        return entry.isDirectory() ? files(path) : path.endsWith('.ink') ? [path] : [];
      });
    const names = files('src/story').flatMap(path =>
      [...readFileSync(path, 'utf8').matchAll(/#\s*bg\s*:\s*([^\s#]+)/g)].map(match => match[1]!),
    );
    expect(names.length).toBeGreaterThan(0);
    for (const name of new Set(names)) {
      expect(Object.hasOwn(backgrounds, name), `unregistered bg:${name}`).toBe(true);
      expect((await backgrounds[name]!()).default).toMatch(/\.svg(?:\?|$)/);
      expect(readFileSync(`src/ui/assets/${name}.svg`, 'utf8')).toContain('<svg');
    }
  });
});

import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Story } from 'inkjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build, createServer, normalizePath } from 'vite';
import { compileInk, expandSceneIncludes, inkPlugin, sceneFiles } from '../plugins/vite-plugin-ink';

const dirs: string[] = [];
function project(files: Record<string, string>, base = tmpdir()): string {
  const dir = mkdtempSync(path.join(base, 'ink-plugin-'));
  dirs.push(dir);
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    writeFileSync(path.join(dir, name), text);
  }
  return dir;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe('ink build plugin', () => {
  it('includes every file in scenes/ at the marker, in sorted order', () => {
    const dir = project({
      'main.ink': '// @include-scenes\n\n-> a\n',
      'scenes/b.ink': '=== b ===\nB\n-> END\n',
      'scenes/a.ink': '=== a ===\nA\n-> b\n',
      'scenes/notes.txt': 'ignored',
    });
    expect(sceneFiles(dir)).toEqual(['a.ink', 'b.ink']);
    expect(expandSceneIncludes('x\n// @include-scenes\ny', dir)).toBe(
      'x\nINCLUDE scenes/a.ink\nINCLUDE scenes/b.ink\ny',
    );
    // A scene added later is picked up with no edit to main.ink.
    const story = new Story(compileInk(path.join(dir, 'main.ink')));
    const lines: string[] = [];
    while (story.canContinue) lines.push((story.Continue() ?? '').trim());
    expect(lines.filter(Boolean)).toEqual(['A', 'B']);
  });

  it('fails the build with the ink error message on a syntax error', () => {
    const dir = project({ 'main.ink': '-> nowhere\n' });
    expect(() => compileInk(path.join(dir, 'main.ink'))).toThrow(/ink compile failed/);
  });

  it.each([false, true])(
    'serves an ink import and reloads includes and scenes (polling: %s)',
    async usePolling => {
      // Keep the watched fixture outside node_modules, even when TEMP points there on Windows.
      const dir = project(
        {
          'entry.js': "import story from './main.ink'; export default story;",
          'main.ink': 'INCLUDE lib/text.ink\n// @include-scenes\n-> a\n',
          'lib/text.ink': '=== text ===\nOriginal include\n-> END\n',
          'scenes/a.ink': '=== a ===\nA\n-> text\n',
        },
        process.cwd(),
      );
      let ready!: () => void;
      const watcherReady = new Promise<void>(resolve => {
        ready = resolve;
      });
      const server = await createServer({
        configFile: false,
        root: dir,
        plugins: [
          inkPlugin(),
          {
            name: 'watcher-ready',
            configureServer(server) {
              server.watcher.once('ready', ready);
            },
          },
        ],
        server: { port: 0, watch: { usePolling, interval: 20 } },
        logLevel: 'silent',
      });
      try {
        await server.listen();
        await watcherReady;
        await vi.waitFor(
          () => {
            const scenes = normalizePath(path.join(dir, 'scenes')).toLowerCase();
            const watched = Object.entries(server.watcher.getWatched()).find(
              ([directory]) => normalizePath(directory).toLowerCase() === scenes,
            );
            expect(watched?.[1]).toContain('a.ink');
          },
          { timeout: 5000 },
        );
        const sent = vi.spyOn(server.ws, 'send');
        const reloads = () =>
          sent.mock.calls.filter(
            ([message]: unknown[]) =>
              typeof message === 'object' && message !== null && 'type' in message && message.type === 'full-reload',
          );
        // Load the importing module first, as a browser does: Vite then resolves load-hook watch files.
        await server.transformRequest('/entry.js');
        const load = async () => (await server.transformRequest('/main.ink?import'))!.code;
        expect(await load()).toContain('Original include');

        writeFileSync(path.join(dir, 'lib/text.ink'), '=== text ===\nChanged include\n-> END\n');
        await vi.waitFor(() => expect(sent).toHaveBeenCalledWith({ type: 'full-reload' }), { timeout: 5000 });
        expect(await load()).toContain('Changed include');
        expect(reloads()).toHaveLength(1);

        sent.mockClear();
        // Polling exposes an ignoreInitial rescan swallowing this create immediately after an Ink reload.
        writeFileSync(path.join(dir, 'scenes/new.ink'), '=== new_scene ===\nNew scene\n-> END\n');
        await vi.waitFor(() => expect(sent).toHaveBeenCalledWith({ type: 'full-reload' }), { timeout: 5000 });
        expect(await load()).toContain('New scene');
        expect(reloads()).toHaveLength(1);

        sent.mockClear();
        rmSync(path.join(dir, 'scenes/new.ink'));
        await vi.waitFor(() => expect(sent).toHaveBeenCalledWith({ type: 'full-reload' }), { timeout: 5000 });
        expect(await load()).not.toContain('New scene');
        expect(reloads()).toHaveLength(1);
      } finally {
        await server.close();
      }
    },
    20000,
  );

  it('rebuilds added and removed scenes in build watch mode', async () => {
    const dir = project(
      {
        'entry.js': "import story from './main.ink'; export default story;",
        'main.ink': '// @include-scenes\n-> a\n',
        'scenes/a.ink': '=== a ===\nOriginal scene\n-> END\n',
      },
      process.cwd(),
    );
    const watcher = await build({
      configFile: false,
      root: dir,
      plugins: [inkPlugin()],
      build: {
        lib: { entry: path.join(dir, 'entry.js'), formats: ['es'], fileName: () => 'story.js' },
        minify: false,
        watch: {},
      },
      logLevel: 'silent',
    });
    if (!('on' in watcher)) throw new Error('Expected a build watcher');
    let builds = 0;
    watcher.on('event', event => {
      if (event.code === 'END') builds++;
    });
    try {
      const output = () => readFileSync(path.join(dir, 'dist/story.js'), 'utf8');
      await vi.waitFor(() => expect(builds).toBe(1), { timeout: 5000 });
      expect(output()).toContain('Original scene');
      writeFileSync(path.join(dir, 'scenes/new.ink'), '=== new_scene ===\nNew scene\n-> END\n');
      await vi.waitFor(() => expect(output()).toContain('New scene'), { timeout: 5000 });
      rmSync(path.join(dir, 'scenes/new.ink'));
      await vi.waitFor(() => expect(output()).not.toContain('New scene'), { timeout: 5000 });
      expect(builds).toBeGreaterThanOrEqual(3);
    } finally {
      await watcher.close();
    }
  }, 20000);
});

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Story } from 'inkjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServer } from 'vite';
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

  it('serves an ink import and reloads changed includes and added or removed scenes', async () => {
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
      server: { port: 0 },
      logLevel: 'silent',
    });
    try {
      await server.listen();
      await watcherReady;
      const sent = vi.spyOn(server.ws, 'send');
      // Load the importing module first, as a browser does: Vite then resolves load-hook watch files.
      await server.transformRequest('/entry.js');
      const load = async () => (await server.transformRequest('/main.ink?import'))!.code;
      expect(await load()).toContain('Original include');

      writeFileSync(path.join(dir, 'lib/text.ink'), '=== text ===\nChanged include\n-> END\n');
      await vi.waitFor(() => expect(sent).toHaveBeenCalledWith({ type: 'full-reload' }));
      expect(await load()).toContain('Changed include');

      sent.mockClear();
      writeFileSync(path.join(dir, 'scenes/new.ink'), '=== new_scene ===\nNew scene\n-> END\n');
      await vi.waitFor(() => expect(sent).toHaveBeenCalledWith({ type: 'full-reload' }));
      expect(await load()).toContain('New scene');

      sent.mockClear();
      rmSync(path.join(dir, 'scenes/new.ink'));
      await vi.waitFor(() => expect(sent).toHaveBeenCalledWith({ type: 'full-reload' }));
      expect(await load()).not.toContain('New scene');
    } finally {
      await server.close();
    }
  });
});

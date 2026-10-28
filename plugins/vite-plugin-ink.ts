// Compiles *.ink files to ink runtime JSON at build/dev/test time, so the browser ships only the small
// inkjs runtime (not the compiler) and ink syntax errors fail the build with file/line messages.
import path from 'node:path';
import { normalizePath, type Plugin, type ViteDevServer } from 'vite';
import { Compiler, CompilerOptions } from 'inkjs/full';
import type { IFileHandler } from 'inkjs/compiler/IFileHandler';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

/** Marker line in main.ink that expands to an INCLUDE for every file in scenes/ (sorted), so adding a scene never edits main.ink. */
export const SCENES_MARKER = '// @include-scenes';

export function sceneFiles(dir: string): string[] {
  const scenes = path.join(dir, 'scenes');
  return existsSync(scenes)
    ? readdirSync(scenes)
        .filter(f => f.endsWith('.ink'))
        .sort()
    : [];
}

export function expandSceneIncludes(source: string, dir: string): string {
  const includes = sceneFiles(dir)
    .map(f => `INCLUDE scenes/${f}`)
    .join('\n');
  return source
    .split('\n')
    .map(line => (line.trim() === SCENES_MARKER ? includes : line))
    .join('\n');
}

export function compileInk(file: string, loaded: string[] = []): string {
  const errors: string[] = [];
  const dir = path.dirname(file);
  const handler: IFileHandler = {
    ResolveInkFilename: name => path.resolve(dir, name),
    LoadInkFileContents: name => {
      loaded.push(name);
      return readFileSync(name, 'utf8');
    },
  };
  const options = new CompilerOptions(
    file,
    [],
    false,
    (message, type) => {
      if (type !== 0) errors.push(message); // 0 = author note
    },
    handler,
  );
  let json = '';
  try {
    json = new Compiler(expandSceneIncludes(readFileSync(file, 'utf8'), dir), options).Compile().ToJson() ?? '';
  } catch {
    /* compile errors are reported through the handler */
  }
  if (errors.length || !json) throw new Error(`ink compile failed (${path.basename(file)}):\n${errors.join('\n')}`);
  return json;
}

export function inkPlugin(): Plugin {
  let devServer: ViteDevServer | undefined;
  const sceneEntries = new Map<string, Set<string>>();
  return {
    name: 'ink',
    enforce: 'pre',
    configureServer(server) {
      devServer = server;
      const scenesChanged = (file: string) => {
        if (!file.endsWith('.ink')) return;
        const entries = sceneEntries.get(normalizePath(path.dirname(file)));
        if (!entries) return;
        // New files have no import-graph edge yet. Invalidate every entry that expands this directory.
        for (const environment of Object.values(server.environments)) {
          for (const entry of entries) {
            for (const mod of environment.moduleGraph.getModulesByFile(entry) ?? []) {
              environment.moduleGraph.invalidateModule(mod);
            }
          }
        }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', scenesChanged).on('unlink', scenesChanged);
    },
    load(id) {
      const file = id.split('?')[0]!;
      if (!file.endsWith('.ink')) return null;
      const loaded: string[] = [];
      const json = compileInk(file, loaded);
      for (const f of [file, ...loaded]) this.addWatchFile(normalizePath(f)); // INCLUDEd files rebuild the story too
      const scenes = normalizePath(path.join(path.dirname(file), 'scenes'));
      if (devServer) {
        // In a load hook, Vite treats addWatchFile entries as imports. A directory cannot resolve as one.
        devServer.watcher.add(scenes);
        const entries = sceneEntries.get(scenes) ?? new Set<string>();
        entries.add(normalizePath(file));
        sceneEntries.set(scenes, entries);
      } else {
        this.addWatchFile(scenes); // retain directory watching for build --watch
      }
      return `export default ${JSON.stringify(json)};`;
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.ink')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

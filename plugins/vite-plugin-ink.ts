// Compiles *.ink files to ink runtime JSON at build/dev/test time, so the browser ships only the small
// inkjs runtime (not the compiler) and ink syntax errors fail the build with file/line messages.
import path from 'node:path';
import { normalizePath, type Plugin, type ViteDevServer } from 'vite';
import { Compiler, CompilerOptions } from 'inkjs/full';
import type { IFileHandler } from 'inkjs/compiler/IFileHandler';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';

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
  const directoryKey = (dir: string) => {
    const resolved = normalizePath(existsSync(dir) ? realpathSync.native(dir) : path.resolve(dir));
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  };
  return {
    name: 'ink',
    enforce: 'pre',
    configureServer(server) {
      devServer = server;
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
        const key = directoryKey(scenes);
        const entries = sceneEntries.get(key) ?? new Set<string>();
        const relative = path.relative(devServer.config.root, scenes);
        // The root is already watched. Re-adding starts an ignoreInitial scan that can swallow new files.
        if (
          !sceneEntries.has(key) &&
          (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
        ) {
          devServer.watcher.add(scenes);
        }
        entries.add(normalizePath(file));
        sceneEntries.set(key, entries);
      } else {
        this.addWatchFile(scenes); // retain directory watching for build --watch
      }
      return `export default ${JSON.stringify(json)};`;
    },
    hotUpdate({ file, timestamp }) {
      if (file.endsWith('.ink')) {
        // Unlike handleHotUpdate, this hook also runs for create/delete, before sending the reload.
        const graph = this.environment.moduleGraph;
        for (const entry of sceneEntries.get(directoryKey(path.dirname(file))) ?? []) {
          for (const mod of graph.getModulesByFile(entry) ?? []) graph.invalidateModule(mod, new Set(), timestamp);
        }
        this.environment.hot.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

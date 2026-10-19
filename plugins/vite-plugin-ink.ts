// Compiles *.ink files to ink runtime JSON at build/dev/test time, so the browser ships only the small
// inkjs runtime (not the compiler) and ink syntax errors fail the build with file/line messages.
import path from 'node:path';
import type { Plugin } from 'vite';
import { Compiler, CompilerOptions } from 'inkjs/full';
import type { IFileHandler } from 'inkjs/compiler/IFileHandler';
import { readFileSync } from 'node:fs';

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
    json = new Compiler(readFileSync(file, 'utf8'), options).Compile().ToJson() ?? '';
  } catch {
    /* compile errors are reported through the handler */
  }
  if (errors.length || !json) throw new Error(`ink compile failed (${path.basename(file)}):\n${errors.join('\n')}`);
  return json;
}

export function inkPlugin(): Plugin {
  return {
    name: 'ink',
    enforce: 'pre',
    load(id) {
      const file = id.split('?')[0]!;
      if (!file.endsWith('.ink')) return null;
      const loaded: string[] = [];
      const json = compileInk(file, loaded);
      for (const f of [file, ...loaded]) this.addWatchFile(f); // INCLUDEd files rebuild the story too
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

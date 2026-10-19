import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Story } from 'inkjs';
import { afterEach, describe, expect, it } from 'vitest';
import { compileInk, expandSceneIncludes, sceneFiles } from '../plugins/vite-plugin-ink';

const dirs: string[] = [];
function project(files: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'ink-plugin-'));
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
});

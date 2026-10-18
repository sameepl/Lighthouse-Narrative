// Builds the static site into ./site : landing page + plain/ ink/ shared/ + react (vite build).
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
rmSync('site', { recursive: true, force: true });
mkdirSync('site');

if (!existsSync('react/node_modules')) run('npm ci', 'react');
run('npx vite build', 'react');

cpSync('landing/index.html', 'site/index.html');
cpSync('shared', 'site/shared', { recursive: true });
cpSync('plain', 'site/plain', { recursive: true });
cpSync('ink', 'site/ink', { recursive: true, filter: s => !s.includes('node_modules') });
cpSync('react/dist', 'site/react', { recursive: true });
console.log('site/ ready');

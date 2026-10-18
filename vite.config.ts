import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { inkPlugin } from './plugins/vite-plugin-ink';

export default defineConfig({
  base: './', // relative asset paths: works under any GitHub Pages sub-path
  plugins: [inkPlugin(), react()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // The module cache keys on the entry .ink file only, so edits to INCLUDEd scene files went unnoticed.
    fsModuleCache: false,
  },
});

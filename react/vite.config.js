import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: { alias: { '@shared': path.resolve(__dirname, '../shared') } },
  server: { host: true, fs: { allow: ['..'] } },
});

/// <reference types="vite/client" />
// *.ink files are compiled by plugins/vite-plugin-ink.ts and default-export the ink runtime JSON string.
declare module '*.ink' {
  const json: string;
  export default json;
}

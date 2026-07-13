import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
  // SWC transpiles the NestJS decorators (and emits the metadata esbuild can't),
  // so the money-path services import cleanly under vitest.
  plugins: [swc.vite({ module: { type: 'es6' } })],
});

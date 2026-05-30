import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Resolve content-core from source so tests always see the latest schema
      '@nacianilcom/content-core': path.resolve(
        __dirname,
        '../../packages/content-core/src/index.ts',
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
  },
});

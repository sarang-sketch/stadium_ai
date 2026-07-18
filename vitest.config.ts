import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vitest configuration for StadiumAI.
 *
 * Two projects share a single process/coverage run:
 * - "node": services, repositories, adapters, utils, and API route
 *   integration tests. These never touch the DOM, so they run in Vitest's
 *   lightweight "node" environment. Test files live under `__tests__/unit/`
 *   and `__tests__/integration/`, mirroring `src/`.
 * - "jsdom": React component tests that render via React Testing Library.
 *   These are co-located with their components as `*.test.tsx` under `src/`.
 *
 * Both projects share the same path aliases (kept in sync with tsconfig.json)
 * and the same setup file (`__tests__/setup.ts`) for jest-dom matchers.
 */
const alias = {
  '@': path.resolve(__dirname, './src'),
  '@/app': path.resolve(__dirname, './src/app'),
  '@/components': path.resolve(__dirname, './src/components'),
  '@/hooks': path.resolve(__dirname, './src/hooks'),
  '@/services': path.resolve(__dirname, './src/services'),
  '@/repositories': path.resolve(__dirname, './src/repositories'),
  '@/adapters': path.resolve(__dirname, './src/adapters'),
  '@/lib': path.resolve(__dirname, './src/lib'),
  '@/middleware': path.resolve(__dirname, './src/middleware'),
  '@/types': path.resolve(__dirname, './src/types'),
  '@/utils': path.resolve(__dirname, './src/utils'),
};

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/app/**/layout.tsx', 'src/**/*.d.ts', '**/.gitkeep'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: { label: 'node', color: 'blue' },
          environment: 'node',
          setupFiles: ['./__tests__/setup.ts'],
          include: [
            '__tests__/unit/**/*.{test,spec}.ts',
            '__tests__/integration/**/*.{test,spec}.ts',
          ],
        },
        resolve: { alias },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: { label: 'jsdom', color: 'magenta' },
          environment: 'jsdom',
          setupFiles: ['./__tests__/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
        },
        resolve: { alias },
      },
    ],
  },
});

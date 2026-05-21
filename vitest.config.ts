import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.tsx'],
    // Unit/component tests live in src/. Deno edge-function tests
    // (supabase/functions) and Playwright e2e tests (tests/) run with their
    // own runners and must not be collected by vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'supabase/functions/**', 'tests/**'],
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'test-anon-key',
    },
    server: {
      deps: {
        // Avoid esbuild dep pre-bundling which can hang in offline/sandboxed envs
        optimizer: { web: { enabled: false } },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

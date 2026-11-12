import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.tsx"],
    // Vitest only owns the unit/component tests under src/. Playwright e2e specs
    // (tests/e2e) and Deno edge-function tests (supabase/functions) have their own
    // runners and break when collected here, so they are excluded explicitly.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "tests/e2e/**", "supabase/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html", "json-summary"],
      reportsDirectory: ".qa-report/coverage",
      include: ["src/services/**", "src/features/**/services/**", "src/lib/**"],
      exclude: [
        "**/*.d.ts",
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "src/lib/schemas/**",
      ],
      // Coverage gate — valores reais medidos (12/2026); sobe 5pp por rodada até 70/60/60/70.
      thresholds: {
        lines: 6,
        branches: 7,
        functions: 5,
        statements: 5,
      },
    },
    // Dummy Supabase credentials so the auto-generated client (which calls
    // createClient at module load) does not throw "supabaseUrl is required"
    // when a component graph is imported in tests.
    env: {
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

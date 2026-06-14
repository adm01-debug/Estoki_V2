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

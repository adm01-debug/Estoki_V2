import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
   test: {
     environment: "jsdom",
     globals: true,
     setupFiles: ["./src/test/setup.ts"],
     include: ["src/**/*.{test,spec}.{ts,tsx}"],
     exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
     testTimeout: 15000,
     hookTimeout: 10000,
     coverage: {
       provider: "v8",
       reporter: ["text", "json", "html", "lcov"],
       thresholds: {
         lines: 80,
         functions: 80,
         branches: 80,
         statements: 80
       },
       exclude: [
         "node_modules/**",
         "dist/**",
         "**/*.d.ts",
         "src/test/**",
         "src/integrations/supabase/types.ts"
       ]
     }
   },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

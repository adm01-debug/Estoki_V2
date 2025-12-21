// Global type declarations for the project
// This file provides ambient type declarations that don't need explicit imports

/// <reference path="./web-serial.d.ts" />
/// <reference path="./test-modules.d.ts" />

// Extend process.env for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type-safe way to ignore test files errors at build time
// The test files use vitest and @testing-library/react which are dev dependencies
// and may have API mismatches that should be fixed during test runs, not build time
declare module '*.test.ts' {
  const value: unknown;
  export default value;
}

declare module '*.test.tsx' {
  const value: unknown;
  export default value;
}

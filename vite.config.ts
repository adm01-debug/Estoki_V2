import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * Carrega o plugin do Sentry só quando SENTRY_AUTH_TOKEN + org/project
 * estão presentes no ambiente de build (produção/CI). Isso mantém o dev
 * local rápido e evita erro em builds sem credenciais.
 */
async function loadSentryPlugin(): Promise<unknown> {
  const { SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT } = process.env;
  if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT) return null;
  try {
    const pkg = "@sentry/vite-plugin";
    const mod = (await import(/* @vite-ignore */ pkg)) as {
      sentryVitePlugin: (opts: Record<string, unknown>) => unknown;
    };
    return mod.sentryVitePlugin({
      authToken: SENTRY_AUTH_TOKEN,
      org: SENTRY_ORG,
      project: SENTRY_PROJECT,
      sourcemaps: { assets: "./dist/**" },
      telemetry: false,
    });
  } catch {
    // Plugin não instalado — segue sem upload de sourcemaps.
    return null;
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && (await loadSentryPlugin()),
    process.env.ANALYZE === "true" &&
      visualizer({
        filename: "dist/stats.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
    mode === "production" &&
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "offline.html"],
        manifest: {
          name: "WMS - Sistema de Gestão de Armazém",
          short_name: "WMS",
          description: "Sistema completo de gestão de armazém e logística",
          theme_color: "#3b82f6",
          background_color: "#0f172a",
          display: "standalone",
          orientation: "portrait-primary",
          start_url: "/",
          icons: [
            {
              src: "/favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallbackDenylist: [/^\/~oauth/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24,
                },
              },
            },
          ],
        },
      }),
  ].filter(Boolean),
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router",
      "react-router-dom",
    ],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-router",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  build: {
    target: "es2020",
    modulePreload: {
      polyfill: false, // Modern browsers support modulepreload natively
    },
    cssCodeSplit: true,
    // 'hidden' gera sourcemaps para upload ao Sentry mas não referencia no bundle.
    sourcemap: (mode === "production" ? "hidden" : false) as "hidden" | false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug", "console.info"],
        passes: 2,
      },
      mangle: { safari10: true },
    },
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Only split heavy, side-effect-free optional libs into their own
          // chunks. Everything else (React, Radix, Lucide, Supabase, Router)
          // stays in the default vendor chunk so Rollup controls evaluation
          // order and avoids circular cross-chunk imports that produced the
          // "Cannot read properties of undefined (reading 'forwardRef')"
          // crash in production.
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-"))
              return "vendor-recharts";
            if (id.includes("framer-motion"))
              return "vendor-motion";
            // jspdf/exceljs/papaparse are all consumed via dynamic import().
            // Let Rollup auto-code-split so each ends up in its own async chunk
            // that's only fetched when the feature is used.
          }
        },
      },
    },
  },
}));

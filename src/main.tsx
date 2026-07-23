import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { prefetchCriticalRoutes } from "./lib/prefetch";
import { initWebVitals } from "./lib/web-vitals";
import { setupGlobalErrorHandler } from "./config/error-handler";
import { initSentry } from "./lib/sentry";
// 0) Setup global monitoring
setupGlobalErrorHandler();
initSentry();

// Suppress noisy errors
window.addEventListener("unhandledrejection", (event) => {
  console.error("[Unhandled Promise]", event.reason);
  event.preventDefault();
});

window.addEventListener("error", (event) => {
  if (event.message?.includes("ResizeObserver")) {
    event.preventDefault();
    return;
  }
  console.error("[Global Error]", event.message, event.filename, event.lineno);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

// 1) Mount the app IMMEDIATELY — never delay rendering
const root = createRoot(rootElement);
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// 2) Post-mount: prefetch routes & web vitals
requestAnimationFrame(() => {
  prefetchCriticalRoutes();
  initWebVitals();
});

// 3) Service Worker — registro guardado (só em produção real, fora de preview Lovable / iframe / dev).
//    Em contextos proibidos, o helper faz UNREGISTER para limpar SWs stale.
import("./lib/register-sw").then(({ registerServiceWorker }) => {
  registerServiceWorker().catch(() => {});
});

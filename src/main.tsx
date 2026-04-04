import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { prefetchCriticalRoutes } from "./lib/prefetch";
import { initWebVitals } from "./lib/web-vitals";

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
root.render(<App />);

// 2) Post-mount: prefetch routes & web vitals
requestAnimationFrame(() => {
  prefetchCriticalRoutes();
  initWebVitals();
});

// 3) Background: clean up stale service workers in preview/dev (fire-and-forget, never reload)
if ("serviceWorker" in navigator && (import.meta.env.DEV || /lovable/.test(window.location.hostname))) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
  
  if ("caches" in window) {
    caches.keys().then((keys) => {
      keys.filter((k) => k.startsWith("estoki-") || k.includes("workbox"))
        .forEach((k) => caches.delete(k));
    }).catch(() => {});
  }
}

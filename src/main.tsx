import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Global unhandled error/rejection handler
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
import { prefetchCriticalRoutes } from "./lib/prefetch";
import { initWebVitals } from "./lib/web-vitals";

const rootElement = document.getElementById("root");

async function bootstrap() {
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const isPreviewHost = /lovable(project)?\.(com|app)$/.test(window.location.hostname);
  const shouldResetPwa = (import.meta.env.DEV || isPreviewHost) && "serviceWorker" in navigator;

  if (shouldResetPwa) {
    const resetKey = "wms-sw-reset-v1";
    const alreadyReset = sessionStorage.getItem(resetKey) === "done";

    if (!alreadyReset) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => key.startsWith("estoki-") || key.includes("workbox"))
            .map((key) => caches.delete(key))
        );
      }

      sessionStorage.setItem(resetKey, "done");

      if (registrations.length > 0 || navigator.serviceWorker.controller) {
        window.location.reload();
        return;
      }
    }
  }

  createRoot(rootElement).render(<App />);

  // Prefetch critical routes and init monitoring after render
  requestAnimationFrame(() => {
    prefetchCriticalRoutes();
    initWebVitals();
  });
}

bootstrap();

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
const PWA_RESET_TIMEOUT_MS = 1500;

let hasRenderedApp = false;

function renderApp() {
  if (!rootElement || hasRenderedApp) {
    return;
  }

  hasRenderedApp = true;
  createRoot(rootElement).render(<App />);

  requestAnimationFrame(() => {
    prefetchCriticalRoutes();
    initWebVitals();
  });
}

async function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs = PWA_RESET_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}

async function resetPreviewPwa(): Promise<boolean> {
  const resetKey = "wms-sw-reset-v2";
  const alreadyReset = sessionStorage.getItem(resetKey) === "done";

  if (alreadyReset) {
    return false;
  }

  const hadController = Boolean(navigator.serviceWorker.controller);

  try {
    const registrations = await withTimeout(navigator.serviceWorker.getRegistrations(), [] as ServiceWorkerRegistration[]);
    const hadRegistrations = registrations.length > 0;

    if (hadRegistrations) {
      await withTimeout(
        Promise.allSettled(registrations.map((registration) => registration.unregister())),
        [] as PromiseSettledResult<boolean>[],
      );
    }

    if ("caches" in window) {
      const cacheKeys = await withTimeout(caches.keys(), [] as string[]);
      const staleKeys = cacheKeys.filter((key) => key.startsWith("estoki-") || key.includes("workbox"));

      if (staleKeys.length > 0) {
        await withTimeout(
          Promise.allSettled(staleKeys.map((key) => caches.delete(key))),
          [] as PromiseSettledResult<boolean>[],
        );
      }
    }

    sessionStorage.setItem(resetKey, "done");

    return hadRegistrations || hadController;
  } catch (error) {
    console.warn("[Bootstrap] Failed to reset preview PWA safely", error);
    sessionStorage.setItem(resetKey, "done");
    return false;
  }
}

async function bootstrap() {
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const isPreviewHost = /lovable(project)?\.(com|app)$/.test(window.location.hostname);
  const shouldResetPwa = (import.meta.env.DEV || isPreviewHost) && "serviceWorker" in navigator;

  if (shouldResetPwa) {
    const shouldReload = await resetPreviewPwa();

    if (shouldReload) {
      window.location.reload();
      return;
    }
  }

  renderApp();
}

bootstrap().catch((error) => {
  console.error("[Bootstrap] Failed to initialize app", error);
  renderApp();
});

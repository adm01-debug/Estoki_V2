/**
 * Service Worker Registration — guarded para preview Lovable + dev.
 *
 * Regras (skill/pwa):
 *  - Nunca registrar em dev, iframe, hosts de preview Lovable, ou com ?sw=off
 *  - Em qualquer contexto proibido, faz UNREGISTER de /sw.js para limpar caches antigos
 *  - Só registra em produção real (domínio publicado / custom domain)
 *  - `vite-plugin-pwa` é o único emissor de /sw.js — não editar manualmente
 */
import { logger } from "@/utils/logger";

const APP_SW_PATH = "/sw.js";

function isForbiddenContext(): { forbidden: boolean; reason: string } {
  if (!import.meta.env.PROD) return { forbidden: true, reason: "dev" };
  if (typeof window === "undefined") return { forbidden: true, reason: "ssr" };
  if (window.self !== window.top) return { forbidden: true, reason: "iframe" };

  const host = window.location.hostname;
  const isLovablePreview =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  if (isLovablePreview) return { forbidden: true, reason: "lovable-preview" };

  if (new URLSearchParams(window.location.search).get("sw") === "off") {
    return { forbidden: true, reason: "kill-switch" };
  }

  return { forbidden: false, reason: "" };
}

async function unregisterAppSw(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL ?? r.installing?.scriptURL ?? r.waiting?.scriptURL ?? "";
          return url.endsWith(APP_SW_PATH);
        })
        .map((r) => r.unregister())
    );
  } catch {
    /* noop */
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const gate = isForbiddenContext();
  if (gate.forbidden) {
    await unregisterAppSw();
    if (import.meta.env.DEV) logger.debug(`[SW] registro suprimido (${gate.reason})`);
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(APP_SW_PATH, {
      scope: "/",
      updateViaCache: "none",
    });

    // Check for updates periodicamente
    setInterval(() => registration.update(), 60 * 60 * 1000);

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent("sw:update-available"));
        }
      });
    });

    return registration;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[SW] Registration failed:", error);
    return null;
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    if (import.meta.env.DEV) logger.debug("Service Worker removido", { success });
    return success;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[SW] Unregister failed:", error);
    return false;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  return await Notification.requestPermission();
}

// Subscribe to push notifications
export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ""
      ) as BufferSource,
    });

    if (import.meta.env.DEV)
      logger.debug("Push subscription criada", { endpoint: subscription.endpoint });
    return subscription;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[SW] Push subscription failed:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default registerServiceWorker;

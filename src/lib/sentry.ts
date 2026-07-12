import * as Sentry from "@sentry/react";
import { logger } from "@/utils/logger";

interface SentryUser {
  id: string;
  email?: string;
}

/**
 * Remove PII conhecida (email, tokens, senhas) do payload antes de enviar
 * ao Sentry, mesmo quando aparece dentro de mensagens ou contextos custom.
 */
function scrubPII<T>(value: T): T {
  if (value == null || typeof value !== "object") return value;
  const clone: Record<string, unknown> = Array.isArray(value)
    ? [...(value as unknown[])]
    : { ...(value as Record<string, unknown>) };
  for (const key of Object.keys(clone)) {
    if (/token|password|secret|authorization|email|cpf|cnpj/i.test(key)) {
      clone[key] = "[redacted]";
    } else if (typeof clone[key] === "object") {
      clone[key] = scrubPII(clone[key]);
    }
  }
  return clone as T;
}

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!import.meta.env.PROD || !dsn) {
    if (import.meta.env.DEV) logger.debug("Sentry desabilitado (dev ou DSN ausente)");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION as string | undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: 0.15,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      if (event.extra) event.extra = scrubPII(event.extra);
      if (event.contexts) event.contexts = scrubPII(event.contexts);
      return event;
    },
  });
  initialized = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.error("[captureException]", error, context);
    return;
  }
  Sentry.captureException(error, context ? { extra: scrubPII(context) } : undefined);
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    level: "info",
    data: data ? scrubPII(data) : undefined,
  });
}

export function setUser(user: SentryUser | null) {
  if (!user) return Sentry.setUser(null);
  // Nunca enviar email — apenas identificador opaco.
  Sentry.setUser({ id: user.id });
}

export function clearUser() {
  Sentry.setUser(null);
}

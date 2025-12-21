// Sentry configuration for error monitoring
import * as Sentry from "@sentry/react";

export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
    });
  }
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  console.error(error);
  if (import.meta.env.PROD) {
    Sentry.captureException(error, { extra: context });
  }
}

export function setUser(user: { id: string; email: string }) {
  Sentry.setUser({ id: user.id, email: user.email });
}

export function clearUser() {
  Sentry.setUser(null);
}

import * as Sentry from "@sentry/react";
import { supabase } from "@/integrations/supabase/client";

export const initMonitoring = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

export const logError = (error: Error, context?: Record<string, any>): void => {
  if (import.meta.env.DEV) console.error(error);
  Sentry.captureException(error, { extra: context });

  // Also log to Supabase for internal tracking if needed
  supabase
    .from("audit_log")
    .insert([
      {
        action: "error",
        entity_type: "system",
        metadata: { message: error.message, ...context },
        created_at: new Date().toISOString(),
      },
    ])
    .then(({ error: pgError }) => {
      if (pgError) console.error("Failed to log error to DB", pgError);
    });
};

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (import.meta.env.DEV) console.log(`[Event] ${name}:`, properties);
  Sentry.addBreadcrumb({
    category: "event",
    message: name,
    data: properties,
    level: "info",
  });
};

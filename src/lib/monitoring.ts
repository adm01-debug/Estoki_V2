import * as Sentry from "@sentry/react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const initMonitoring = (): void => {
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

export const logError = (error: Error, context?: Record<string, unknown>): void => {
  if (import.meta.env.DEV) logger.error("Erro monitorado", error, context);
  Sentry.captureException(error, { extra: context });

  supabase
    .rpc("log_audit_event", {
      p_action: "error",
      p_entity_type: "system",
      p_metadata: { message: error.message, ...context },
    })
    .then(({ error: pgError }) => {
      if (pgError) logger.error("Falha ao registrar erro no banco", pgError);
    });
};

export const trackEvent = (name: string, properties?: Record<string, unknown>): void => {
  if (import.meta.env.DEV) logger.debug("Evento monitorado", { name, properties });
  Sentry.addBreadcrumb({
    category: "event",
    message: name,
    data: properties,
    level: "info",
  });
};

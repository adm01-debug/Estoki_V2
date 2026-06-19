// Sentry configuration for error monitoring (stub - install @sentry/react for full functionality)
import { logger } from "@/utils/logger";

// Stub types to avoid import errors
interface SentryUser {
  id: string;
  email: string;
}

export function initSentry() {
  // Sentry is optional - will work when @sentry/react is installed
  if (import.meta.env.DEV) logger.debug("Monitoramento Sentry desabilitado");
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) console.error("[Error]", error, context);
}

export function setUser(user: SentryUser) {
  if (import.meta.env.DEV) logger.debug("Usuário Sentry definido", { userId: user.id });
}

export function clearUser() {
  if (import.meta.env.DEV) logger.debug("Usuário Sentry limpo");
}

// Sentry configuration for error monitoring (stub - install @sentry/react for full functionality)

// Stub types to avoid import errors
interface SentryUser {
  id: string;
  email: string;
}

export function initSentry() {
  // Sentry is optional - will work when @sentry/react is installed
  if (import.meta.env.DEV) console.log('[Sentry] Monitoring disabled - @sentry/react not installed');
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  console.error('[Error]', error, context);
}

export function setUser(user: SentryUser) {
  if (import.meta.env.DEV) console.log('[Sentry] User set:', user.id);
}

export function clearUser() {
  if (import.meta.env.DEV) console.log('[Sentry] User cleared');
}
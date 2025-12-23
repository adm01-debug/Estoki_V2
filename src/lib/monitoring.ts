import * as Sentry from '@sentry/react';

export const logError = (error: Error, context?: Record<string, any>): void => {
  console.error(error);
  Sentry.captureException(error, { extra: context });
};

export const logMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info'): void => {
  Sentry.captureMessage(message, level);
};

export const setUserContext = (userId: string, email?: string): void => {
  Sentry.setUser({ id: userId, email });
};

export const clearUserContext = (): void => {
  Sentry.setUser(null);
};

export const trackPerformance = (name: string, fn: () => void): void => {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
};

import { useCallback } from 'react';

export function useTracking() {
  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    if (import.meta.env.DEV) console.log('[Tracking]', { category, action, label, value });
  }, []);

  const trackClick = useCallback((elementId: string) => trackEvent('click', elementId), [trackEvent]);
  const trackError = useCallback((error: Error) => trackEvent('error', error.message), [trackEvent]);

  return { trackEvent, trackClick, trackError };
}

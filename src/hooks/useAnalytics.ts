import { useCallback } from 'react';
export function useAnalytics() {
  const track = useCallback((event: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) { (window as any).gtag('event', event, data); }
    console.log('[Analytics]', event, data);
  }, []);
  const page = useCallback((path: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) { (window as any).gtag('config', 'GA_MEASUREMENT_ID', { page_path: path }); }
  }, []);
  return { track, page };
}

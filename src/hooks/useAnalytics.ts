import { useCallback } from 'react';

 import { logger } from '@/utils/logger';
 
 interface GTag {
   (command: 'event', eventName: string, eventParams?: Record<string, unknown>): void;
   (command: 'config', targetId: string, config?: Record<string, unknown>): void;
 }
 
 declare global {
   interface Window {
     gtag?: GTag;
   }
 }
 
 export function useAnalytics() {
  const track = useCallback((event: string, data?: Record<string, unknown>) => {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', event, data);
     }
     logger.debug('[Analytics] Event tracked', { event, ...data });
  }, []);

  const page = useCallback((path: string) => {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('config', 'GA_MEASUREMENT_ID', { page_path: path });
     }
  }, []);

  const trackPage = useCallback((data: { path: string; title?: string; component?: string }) => {
    track('page_view', data);
    page(data.path);
  }, [track, page]);

  const trackEvent = useCallback((data: { category: string; action: string; label?: string; value?: number }) => {
    track(`${data.category}_${data.action}`, data);
  }, [track]);

  return { track, page, trackPage, trackEvent };
}

import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';
import { logger } from '@/utils/logger';

/**
 * Service to track and analyze Frontend performance metrics.
 * Follows Web Vitals standards for UX excellence.
 */
export const performanceService = {
  init() {
    if (import.meta.env.PROD) {
      this.trackMetric('CLS', onCLS);
      this.trackMetric('FID', onFID);
      this.trackMetric('LCP', onLCP);
      this.trackMetric('FCP', onFCP);
      this.trackMetric('TTFB', onTTFB);
      this.trackMetric('INP', onINP);
    }
  },

  trackMetric(name: string, reporter: (cb: any) => void) {
    reporter(({ name, value, delta, id }: any) => {
      logger.info(`[Perf - ${name}]`, { value, delta, id });
      // In a real scenario, this would send data to a monitoring endpoint (Sentry, LogRocket, etc.)
    });
  }
};

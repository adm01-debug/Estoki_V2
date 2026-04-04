/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS, TTFB, INP) and reports them
 */

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type ReportHandler = (metric: WebVitalMetric) => void;

const thresholds: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  FID: [100, 300],
  CLS: [0.1, 0.25],
  TTFB: [800, 1800],
  INP: [200, 500],
};

function getRating(name: string, value: number): WebVitalMetric['rating'] {
  const [good, poor] = thresholds[name] || [Infinity, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function generateId(): string {
  return `v${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Observe Largest Contentful Paint
 */
function observeLCP(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const value = lastEntry.startTime;
        onReport({
          name: 'LCP',
          value,
          rating: getRating('LCP', value),
          delta: value,
          id: generateId(),
        });
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Silently fail if not supported
  }
}

/**
 * Observe First Input Delay
 */
function observeFID(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const fidEntry = entry as PerformanceEventTiming;
        const value = fidEntry.processingStart - fidEntry.startTime;
        onReport({
          name: 'FID',
          value,
          rating: getRating('FID', value),
          delta: value,
          id: generateId(),
        });
      }
    });
    observer.observe({ type: 'first-input', buffered: true });
  } catch {
    // Silently fail
  }
}

/**
 * Observe Cumulative Layout Shift
 */
function observeCLS(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShift.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (
            sessionValue &&
            firstSessionEntry &&
            lastSessionEntry &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += layoutShift.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = layoutShift.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            onReport({
              name: 'CLS',
              value: clsValue,
              rating: getRating('CLS', clsValue),
              delta: layoutShift.value,
              id: generateId(),
            });
          }
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // Silently fail
  }
}

/**
 * Observe Time to First Byte
 */
function observeTTFB(onReport: ReportHandler): void {
  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      const value = navEntry.responseStart - navEntry.requestStart;
      onReport({
        name: 'TTFB',
        value,
        rating: getRating('TTFB', value),
        delta: value,
        id: generateId(),
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  const reportMetric: ReportHandler = (metric) => {
    // Log in development
    if (import.meta.env.DEV) {
      const color = metric.rating === 'good' ? '#0cce6b' : metric.rating === 'needs-improvement' ? '#ffa400' : '#ff4e42';
      console.log(
        `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`,
        `color: ${color}; font-weight: bold;`
      );
    }

    // Send to analytics in production (if available)
    if (!import.meta.env.DEV && 'sendBeacon' in navigator) {
      try {
        navigator.sendBeacon(
          '/api/vitals',
          JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            page: window.location.pathname,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Silently fail
      }
    }
  };

  // Use requestIdleCallback to avoid blocking main thread
  const observe = () => {
    observeLCP(reportMetric);
    observeFID(reportMetric);
    observeCLS(reportMetric);
    observeTTFB(reportMetric);
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(observe);
  } else {
    setTimeout(observe, 0);
  }
}

/**
 * Get current performance summary
 */
export function getPerformanceSummary(): Record<string, unknown> {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  
  return {
    domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : null,
    domInteractive: nav ? nav.domInteractive - nav.startTime : null,
    loadComplete: nav ? nav.loadEventEnd - nav.startTime : null,
    transferSize: nav ? nav.transferSize : null,
    resourceCount: performance.getEntriesByType('resource').length,
    memoryUsage: (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
      ? {
          used: ((performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
          total: ((performance as Performance & { memory: { totalJSHeapSize: number } }).memory.totalJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
        }
      : null,
  };
}

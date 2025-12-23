type Metric = { name: string; value: number; rating: string };

export const reportWebVitals = (onReport: (metric: Metric) => void): void => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      onReport({
        name: entry.entryType,
        value: entry.duration || 0,
        rating: entry.duration < 100 ? 'good' : entry.duration < 300 ? 'needs-improvement' : 'poor'
      });
    });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
};

export const measurePageLoad = (): number => {
  if (typeof window === 'undefined') return 0;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  return nav?.loadEventEnd - nav?.startTime || 0;
};

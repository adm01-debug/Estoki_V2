export { initWebVitals, getPerformanceSummary } from './web-vitals';

export const reportWebVitals = initWebVitals;

export const measurePageLoad = (): number => {
  if (typeof window === 'undefined') return 0;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  return nav?.loadEventEnd - nav?.startTime || 0;
};

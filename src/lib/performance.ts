// Performance monitoring
import { logger } from "@/utils/logger";

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput?: boolean;
  value?: number;
};

export function measurePerformance() {
  if (typeof window === "undefined" || !window.performance) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "largest-contentful-paint") {
        if (import.meta.env.DEV) logger.debug("LCP medido", { startTime: entry.startTime });
      }
      if (entry.entryType === "first-input") {
        if (import.meta.env.DEV)
          logger.debug("FID medido", {
            value: (entry as PerformanceEventTiming).processingStart - entry.startTime,
          });
      }
    }
  });

  observer.observe({ type: "largest-contentful-paint", buffered: true });
  observer.observe({ type: "first-input", buffered: true });

  // CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value ?? 0;
      }
    }
    if (import.meta.env.DEV) logger.debug("CLS medido", { value: clsValue });
  }).observe({ type: "layout-shift", buffered: true });
}

export function reportWebVitals(metric: { name: string; value: number }) {
  if (import.meta.env.DEV) logger.debug("Web Vital reportado", metric);
  // Send to analytics
}

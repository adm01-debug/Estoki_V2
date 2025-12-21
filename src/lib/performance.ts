// Performance monitoring
export function measurePerformance() {
  if (typeof window === "undefined" || !window.performance) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "largest-contentful-paint") {
        console.log("LCP:", entry.startTime);
      }
      if (entry.entryType === "first-input") {
        console.log("FID:", (entry as PerformanceEventTiming).processingStart - entry.startTime);
      }
    }
  });

  observer.observe({ type: "largest-contentful-paint", buffered: true });
  observer.observe({ type: "first-input", buffered: true });

  // CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as any[]) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    console.log("CLS:", clsValue);
  }).observe({ type: "layout-shift", buffered: true });
}

export function reportWebVitals(metric: { name: string; value: number }) {
  console.log(metric.name, metric.value);
  // Send to analytics
}

import { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/logger";

interface Metric {
  path: string;
  duration: number;
  timestamp: number;
  error?: boolean;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: Metric[] = [];
  private listeners: ((metrics: Metric[]) => void)[] = [];

  private constructor() {}

  static getInstance() {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  track(path: string, duration: number, error = false) {
    const metric = { path, duration, timestamp: Date.now(), error };
    this.metrics.push(metric);
    if (this.metrics.length > 100) this.metrics.shift();

    if (duration > 1000) {
      logger.warn(`Slow response detected at ${path}: ${duration}ms`);
    }
    if (error) {
      logger.error(`Error detected at ${path}`);
    }

    this.notify();
  }

  subscribe(listener: (metrics: Metric[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.metrics]));
  }

  getMetrics() {
    return [...this.metrics];
  }

  getAverageLatency() {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((acc, m) => acc + m.duration, 0);
    return Math.round(total / this.metrics.length);
  }

  getErrorRate() {
    if (this.metrics.length === 0) return 0;
    const errors = this.metrics.filter((m) => m.error).length;
    return Math.round((errors / this.metrics.length) * 100);
  }
}

export const performanceService = PerformanceService.getInstance();

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<Metric[]>(performanceService.getMetrics());

  useEffect(() => {
    return performanceService.subscribe(setMetrics);
  }, []);

  return {
    metrics,
    avgLatency: performanceService.getAverageLatency(),
    errorRate: performanceService.getErrorRate(),
  };
};

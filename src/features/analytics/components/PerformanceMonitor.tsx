import { useEffect } from 'react';
import { performanceService } from '../services/performanceService';

/**
 * Silent component that initializes performance tracking on mount.
 * High-impact for measuring "Senior Level" UX stability.
 */
export function PerformanceMonitor() {
  useEffect(() => {
    performanceService.init();
  }, []);

  return null;
}

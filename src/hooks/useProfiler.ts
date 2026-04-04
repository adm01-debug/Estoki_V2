import { useRef, useEffect } from 'react';

export function useProfiler(id: string, onRender?: (duration: number) => void) {
  const startTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    const duration = performance.now() - startTime.current;
    if (onRender) onRender(duration);
    if (import.meta.env.DEV) {
      console.log(`[Profiler ${id}] Render #${renderCount.current}: ${duration.toFixed(2)}ms`);
    }
    startTime.current = performance.now();
  });

  return { renderCount: renderCount.current };
}

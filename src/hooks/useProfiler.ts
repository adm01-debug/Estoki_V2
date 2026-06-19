import { useRef, useEffect } from "react";
import { logger } from "@/utils/logger";

export function useProfiler(id: string, onRender?: (duration: number) => void) {
  const startTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    const duration = performance.now() - startTime.current;
    if (onRender) onRender(duration);
    if (import.meta.env.DEV) {
      logger.debug("Render monitorado", {
        id,
        renderCount: renderCount.current,
        durationMs: duration.toFixed(2),
      });
    }
    startTime.current = performance.now();
  });

  return { renderCount: renderCount.current };
}

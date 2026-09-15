import { useCallback } from "react";
import { logger } from "@/utils/logger";

export function useTracking() {
  const trackEvent = useCallback(
    (category: string, action: string, label?: string, value?: number) => {
      if (import.meta.env.DEV)
        logger.debug("Evento de tracking", { category, action, label, value });
    },
    []
  );

  const trackClick = useCallback(
    (elementId: string) => trackEvent("click", elementId),
    [trackEvent]
  );
  const trackError = useCallback(
    (error: Error) => trackEvent("error", error.message),
    [trackEvent]
  );

  return { trackEvent, trackClick, trackError };
}

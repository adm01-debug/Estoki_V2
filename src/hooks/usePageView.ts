import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logger } from "@/utils/logger";

export function usePageView() {
  const location = useLocation();
  useEffect(() => {
    if (import.meta.env.DEV) logger.debug("Visualização de página", { path: location.pathname });
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", { page_path: location.pathname });
    }
  }, [location]);
}

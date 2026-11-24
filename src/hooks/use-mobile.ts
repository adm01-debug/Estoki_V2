import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook para detectar se o dispositivo é mobile
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export { useIsMobile as useMobile };

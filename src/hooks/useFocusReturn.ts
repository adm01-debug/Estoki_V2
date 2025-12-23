import { useRef, useCallback, useEffect } from 'react';
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const saveFocus = useCallback(() => { previousFocusRef.current = document.activeElement as HTMLElement; }, []);
  const restoreFocus = useCallback(() => { if (previousFocusRef.current) { previousFocusRef.current.focus(); previousFocusRef.current = null; } }, []);
  return { saveFocus, restoreFocus };
}

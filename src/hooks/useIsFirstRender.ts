import { useRef, useCallback, useEffect } from 'react';
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);
  useEffect(() => { isFirst.current = false; }, []);
  return isFirst.current;
}

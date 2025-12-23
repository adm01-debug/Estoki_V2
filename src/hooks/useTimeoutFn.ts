import { useRef, useCallback } from 'react';
export function useTimeoutFn(fn: () => void, ms: number = 0) {
  const ready = useRef<boolean | null>(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const isReady = useCallback(() => ready.current, []);
  const set = useCallback(() => {
    ready.current = false;
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(() => { ready.current = true; fn(); }, ms);
  }, [ms, fn]);
  const clear = useCallback(() => { ready.current = null; timeout.current && clearTimeout(timeout.current); }, []);
  return [isReady, clear, set] as const;
}

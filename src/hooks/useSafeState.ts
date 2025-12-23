import { useState, useCallback } from 'react';
import { useMounted } from './useMounted';
export function useSafeState<T>(initial: T) {
  const [state, setState] = useState(initial);
  const isMounted = useMounted();
  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMounted()) setState(value);
  }, [isMounted]);
  return [state, setSafeState] as const;
}
export default useSafeState;

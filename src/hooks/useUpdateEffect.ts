import { useEffect, useRef, DependencyList, EffectCallback } from 'react';
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    return effect();
    // deps é repassado pelo consumidor; effect é intencionalmente externo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
export default useUpdateEffect;

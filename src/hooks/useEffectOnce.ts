import { useEffect, EffectCallback } from 'react';
export function useEffectOnce(effect: EffectCallback): void {
  useEffect(effect, []);
}

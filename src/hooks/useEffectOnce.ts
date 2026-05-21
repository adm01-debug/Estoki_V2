import { useEffect, EffectCallback } from 'react';
export function useEffectOnce(effect: EffectCallback): void {
  // executa o efeito apenas uma vez na montagem (semântica do hook)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}

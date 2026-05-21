import { useEffect } from 'react';
export function useLifecycles(mount: () => void, unmount?: () => void): void {
  // mount/unmount rodam apenas no ciclo de montagem (semântica do hook)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { mount(); return unmount; }, []);
}

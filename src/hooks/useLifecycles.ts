import { useEffect } from 'react';
export function useLifecycles(mount: () => void, unmount?: () => void): void {
  useEffect(() => { mount(); return unmount; }, []);
}

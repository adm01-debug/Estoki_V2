import { useCallback } from 'react';
type ConflictStrategy = 'client-wins' | 'server-wins' | 'merge' | 'manual';
export function useConflictResolution<T extends Record<string, any>>(strategy: ConflictStrategy = 'client-wins') {
  const resolve = useCallback((clientData: T, serverData: T): T => {
    if (strategy === 'client-wins') return clientData;
    if (strategy === 'server-wins') return serverData;
    if (strategy === 'merge') return { ...serverData, ...clientData };
    return clientData;
  }, [strategy]);
  const detectConflict = useCallback((clientData: T, serverData: T): boolean => JSON.stringify(clientData) !== JSON.stringify(serverData), []);
  return { resolve, detectConflict };
}

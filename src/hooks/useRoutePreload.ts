import { useCallback } from 'react';
import { prefetchRoute } from '@/lib/prefetch';

/**
 * Returns an onMouseEnter handler that prefetches a route's chunk.
 * Use on sidebar/nav links to eliminate loading spinners.
 */
export function useRoutePreload() {
  const preload = useCallback((path: string) => {
    prefetchRoute(path);
  }, []);

  return preload;
}

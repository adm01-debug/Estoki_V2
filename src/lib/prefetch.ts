/**
 * Route prefetching utility — preloads lazy chunks on hover/visibility
 * to eliminate loading spinners on navigation.
 */

// Map route paths to their dynamic import functions
const routeImports: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/Index'),
  '/dashboard': () => import('../pages/Dashboard'),
  '/dashboard-realtime': () => import('../pages/DashboardTempoReal'),
  '/monitor': () => import('../pages/DashboardOperacional'),
  '/estoque': () => import('../pages/Estoque'),
  '/triagem': () => import('../pages/Triagem'),
  '/recebimento': () => import('../pages/Recebimento'),
  '/produtos': () => import('../pages/Produtos'),
  '/lotes': () => import('../pages/Lotes'),
  '/posicoes': () => import('../pages/Posicoes'),
  '/picking': () => import('../pages/picking/PickingPage'),
  '/romaneios': () => import('../pages/Romaneios'),
  '/scanner': () => import('../pages/Scanner'),
  '/tarefas': () => import('../pages/GestaoTarefas'),
  '/relatorios': () => import('../pages/Relatorios'),
};

const prefetched = new Set<string>();

/**
 * Prefetch a route's chunk. Safe to call multiple times — deduplicates.
 */
export function prefetchRoute(path: string): void {
  if (prefetched.has(path)) return;
  const loader = routeImports[path];
  if (!loader) return;
  prefetched.add(path);
  // Use requestIdleCallback to avoid blocking main thread
  const schedule = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 50));
  schedule(() => {
    loader().catch(() => {
      // If prefetch fails, allow retry
      prefetched.delete(path);
    });
  });
}

/**
 * Prefetch critical routes after initial load.
 * Called once after the app mounts.
 */
export function prefetchCriticalRoutes(): void {
  const critical = ['/', '/dashboard', '/estoque', '/recebimento', '/triagem'];
  critical.forEach((route) => prefetchRoute(route));
}

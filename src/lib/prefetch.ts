/**
 * Route prefetching utility — preloads lazy chunks on hover/visibility
 * to eliminate loading spinners on navigation.
 */

// Map route paths to their dynamic import functions
/**
 * Updated Route Map for Prefetching
 * Points to the actual feature-first paths to ensure cache hits.
 */
const routeImports: Record<string, () => Promise<unknown>> = {
  '/': () => import('../features/dashboard/pages/DashboardPage'),
  '/dashboard': () => import('../pages/Dashboard'),
  '/dashboard-realtime': () => import('../features/analytics/pages/RealtimeDashboardPage'),
  '/monitor': () => import('../pages/DashboardOperacional'),
  '/estoque': () => import('../features/inventory/pages/EstoquePage'),
  '/triagem': () => import('../features/quality/pages/TriagemPage'),
  '/recebimento': () => import('../features/receiving/pages/RecebimentoPage'),
  '/produtos': () => import('../pages/Produtos'),
  '/lotes': () => import('../pages/Lotes'),
  '/posicoes': () => import('../pages/Posicoes'),
  '/picking': () => import('../features/picking/pages/PickingPage'),
  '/romaneios': () => import('../pages/Romaneios'),
  '/scanner': () => import('../pages/Scanner'),
  '/tarefas': () => import('../pages/GestaoTarefas'),
  '/relatorios': () => import('../pages/Relatorios'),
  '/kpis-operacionais': () => import('../features/analytics/pages/KPIsPage'),
  '/expedicao': () => import('../features/shipping/pages/ShippingPage'),
  '/curva-abc': () => import('../features/analytics/pages/ABCAnalysisPage'),
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

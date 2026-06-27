import type { RouteTransitionMap, TransitionName } from "./types";

/**
 * Mapa rota → preset. Suporta wildcards no final (ex: "/wms/*").
 * Use prefixos para casar sub-rotas.
 */
export const defaultRouteMap: RouteTransitionMap = {
  "/": "fade",
  "/dashboard": "fade",
  "/monitor": "zoom-in",
  "/hub": "parallax",
  "/auth": "fade",
  "/wms": "slide-left",
  "/analytics": "slide-up",
  "/admin": "slide-right",
  "/recebimento": "slide-left",
  "/triagem": "slide-left",
  "/estoque": "slide-left",
  "/divergencias": "slide-up",
};

export function resolveRouteTransition(
  pathname: string,
  routes: RouteTransitionMap,
  fallback: TransitionName
): TransitionName {
  if (routes[pathname]) return routes[pathname];
  // longest prefix match
  const match = Object.keys(routes)
    .filter((p) => p !== "/" && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];
  return match ? routes[match] : fallback;
}

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  RouteTransitionMap,
  TransitionContextValue,
  TransitionName,
} from "@/lib/transitions/types";
import { defaultRouteMap } from "@/lib/transitions/registry";

const TransitionContext = createContext<TransitionContextValue>({
  defaultPreset: "fade",
  durationScale: 1,
  disabled: false,
  routes: defaultRouteMap,
});

interface TransitionProviderProps {
  children: ReactNode;
  defaultPreset?: TransitionName;
  durationScale?: number;
  disabled?: boolean;
  routes?: RouteTransitionMap;
}

export function TransitionProvider({
  children,
  defaultPreset = "fade",
  durationScale = 1,
  disabled = false,
  routes,
}: TransitionProviderProps) {
  const value = useMemo<TransitionContextValue>(
    () => ({
      defaultPreset,
      durationScale,
      disabled,
      routes: { ...defaultRouteMap, ...(routes ?? {}) },
    }),
    [defaultPreset, durationScale, disabled, routes]
  );
  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
}

export function useTransitionContext() {
  return useContext(TransitionContext);
}

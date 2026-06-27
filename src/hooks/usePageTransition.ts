import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTransitionContext } from "@/contexts/TransitionContext";
import {
  presets,
  reducedMotionPreset,
} from "@/lib/transitions/presets";
import { resolveRouteTransition } from "@/lib/transitions/registry";
import type { TransitionName, TransitionPreset } from "@/lib/transitions/types";

interface LocationStateWithTransition {
  transition?: TransitionName;
}

/**
 * Resolve o preset de transição para a rota atual.
 * Prioridade: override explícito > location.state.transition > route map > defaultPreset.
 * Respeita prefers-reduced-motion e flag global `disabled`.
 */
export function usePageTransition(override?: TransitionName): TransitionPreset {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { defaultPreset, durationScale, disabled, routes } = useTransitionContext();

  return useMemo(() => {
    if (disabled) return presets.none;
    if (reduced) return reducedMotionPreset;

    const state = location.state as LocationStateWithTransition | null;
    const name: TransitionName =
      override ??
      state?.transition ??
      resolveRouteTransition(location.pathname, routes, defaultPreset);

    const preset = presets[name] ?? presets[defaultPreset];

    if (durationScale === 1) return preset;
    const t = preset.transition as { duration?: number };
    if (typeof t.duration === "number") {
      return {
        ...preset,
        transition: { ...preset.transition, duration: t.duration * durationScale },
      };
    }
    return preset;
  }, [override, location.pathname, location.state, routes, defaultPreset, durationScale, disabled, reduced]);
}

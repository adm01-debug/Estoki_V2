import type { Transition, TargetAndTransition } from "framer-motion";

export type TransitionName =
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "zoom-in"
  | "zoom-out"
  | "flip-x"
  | "flip-y"
  | "parallax"
  | "none";

export interface TransitionPreset {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}

export interface TransitionConfig extends Partial<TransitionPreset> {
  name?: TransitionName;
  durationScale?: number;
}

export type RouteTransitionMap = Record<string, TransitionName>;

export interface TransitionContextValue {
  defaultPreset: TransitionName;
  durationScale: number;
  disabled: boolean;
  routes: RouteTransitionMap;
}

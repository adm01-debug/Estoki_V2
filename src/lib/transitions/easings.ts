import type { Transition } from "framer-motion";

export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  anticipate: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const springs: Record<string, Transition> = {
  gentle: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
  snappy: { type: "spring", stiffness: 380, damping: 35, mass: 1 },
  bouncy: { type: "spring", stiffness: 500, damping: 22, mass: 0.8 },
};

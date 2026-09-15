import { ReactNode, forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { usePageTransition } from "@/hooks/usePageTransition";
import type { TransitionName, TransitionPreset } from "@/lib/transitions/types";

interface PageTransitionProps extends Omit<
  HTMLMotionProps<"div">,
  "initial" | "animate" | "exit" | "transition"
> {
  children: ReactNode;
  name?: TransitionName;
  config?: Partial<TransitionPreset>;
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, name, config, ...props }, ref) => {
    const resolved = usePageTransition(name);
    const initial = config?.initial ?? resolved.initial;
    const animate = config?.animate ?? resolved.animate;
    const exit = config?.exit ?? resolved.exit;
    const transition = config?.transition ?? resolved.transition;
    return (
      <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        {...props}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    );
  }
);

PageTransition.displayName = "PageTransition";

// For use with motion.div directly
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { type: "spring", damping: 25, stiffness: 200 },
};

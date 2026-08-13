import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { haptics } from "@/utils/haptics";

interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface PersistentStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  sticky?: boolean;
}

export function PersistentStepper({
  steps,
  currentStep,
  className,
  sticky = true,
}: PersistentStepperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "z-30 w-full border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md transition-all",
        sticky && "sticky top-16",
        className
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.id} className="group flex flex-1 items-center gap-2 last:flex-none">
              <div className="flex flex-col items-center sm:flex-row sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => haptics.light()}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary text-primary ring-4 ring-primary/10"
                        : "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </motion.div>
                <div className="hidden sm:block">
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-tighter transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground/60"
                    )}
                  >
                    {step.label}
                  </p>
                  {isActive && step.description && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="line-clamp-1 text-[9px] text-muted-foreground"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="mx-2 h-[2px] flex-1 overflow-hidden rounded-full bg-muted/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                    className="h-full bg-primary/40"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

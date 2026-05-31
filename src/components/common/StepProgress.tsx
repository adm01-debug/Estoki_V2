import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute left-0 right-0 top-5 -z-10 mx-6 h-0.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? "var(--primary)" : "var(--muted)",
                  scale: isActive ? 1.2 : 1,
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors",
                  isCompleted || isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
              </motion.div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

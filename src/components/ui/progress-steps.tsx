import React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
  onStepClick?: (index: number) => void;
}

export function ProgressSteps({
  steps,
  currentStep,
  orientation = "horizontal",
  className,
  onStepClick,
}: ProgressStepsProps) {
  const isVertical = orientation === "vertical";

  return (
    <div className={cn(isVertical ? "flex flex-col" : "flex items-center", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <div
            key={step.id}
            className={cn(
              "flex",
              isVertical ? "flex-row items-start" : "flex-col items-center",
              index < steps.length - 1 && (isVertical ? "pb-8" : "flex-1")
            )}
          >
            <div
              className={cn(
                "flex",
                isVertical ? "flex-col items-center" : "w-full flex-row items-center"
              )}
            >
              {/* Step Circle */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                  isClickable && "cursor-pointer hover:bg-primary/20",
                  !isClickable && "cursor-default"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "transition-colors",
                    isVertical ? "mx-auto mt-2 h-full min-h-[2rem] w-0.5" : "mx-3 h-0.5 flex-1",
                    index < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>

            {/* Step Content */}
            <div className={cn(isVertical ? "ml-4 flex-1" : "mt-2 text-center")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProgressSteps;

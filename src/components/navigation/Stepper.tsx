import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
interface StepperProps {
  steps: string[];
  current: number;
  onChange?: (step: number) => void;
  className?: string;
}
export function Stepper({ steps, current, onChange, className }: StepperProps) {
  return (
    <div className={cn("flex w-full items-center", className)}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex cursor-pointer flex-col items-center" onClick={() => onChange?.(i)}>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                i < current && "border-primary bg-primary text-white",
                i === current && "border-primary text-primary",
                i > current && "border-gray-300 text-gray-400"
              )}
            >
              {i < current ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            <span className="mt-1 text-xs">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("mx-2 h-0.5 flex-1", i < current ? "bg-primary" : "bg-gray-300")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

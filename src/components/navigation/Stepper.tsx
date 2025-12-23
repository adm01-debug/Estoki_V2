import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
interface StepperProps { steps: string[]; current: number; onChange?: (step: number) => void; className?: string; }
export function Stepper({ steps, current, onChange, className }: StepperProps) {
  return (
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => onChange?.(i)}>
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
              i < current && 'bg-primary border-primary text-white',
              i === current && 'border-primary text-primary',
              i > current && 'border-gray-300 text-gray-400'
            )}>{i < current ? <Check className="h-5 w-5" /> : i + 1}</div>
            <span className="text-xs mt-1">{step}</span>
          </div>
          {i < steps.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', i < current ? 'bg-primary' : 'bg-gray-300')} />}
        </React.Fragment>
      ))}
    </div>
  );
}

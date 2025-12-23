import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
interface StepsProps { current: number; children: React.ReactNode; className?: string; }
export function Steps({ current, children, className }: StepsProps) {
  return <div className={cn('flex items-center gap-2', className)}>{React.Children.map(children, (child, i) => React.cloneElement(child as React.ReactElement, { index: i, active: i === current, completed: i < current }))}</div>;
}
interface StepProps { index?: number; active?: boolean; completed?: boolean; children: React.ReactNode; }
export function Step({ index = 0, active, completed, children }: StepProps) {
  return (
    <div className={cn('flex items-center gap-2', active && 'text-primary', completed && 'text-green-600')}>
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center border-2', active && 'border-primary bg-primary text-white', completed && 'border-green-600 bg-green-600 text-white')}>
        {completed ? <Check className="h-4 w-4" /> : index + 1}
      </div>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

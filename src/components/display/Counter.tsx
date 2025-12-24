import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
interface CounterProps { value: number; duration?: number; prefix?: string; suffix?: string; className?: string; }
export function Counter({ value, duration = 1000, prefix, suffix, className }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (value - startValue) * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span className={cn("tabular-nums", className)}>{prefix}{displayValue.toLocaleString('pt-BR')}{suffix}</span>;
}

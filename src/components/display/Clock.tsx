import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
interface ClockProps { format?: '12h' | '24h'; showSeconds?: boolean; showDate?: boolean; timezone?: string; className?: string; }
export function Clock({ format = '24h', showSeconds = true, showDate = false, timezone, className }: ClockProps) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', ...(showSeconds && { second: '2-digit' }), hour12: format === '12h', ...(timezone && { timeZone: timezone }) };
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...(timezone && { timeZone: timezone }) };
  return (
    <div className={cn("text-center", className)}>
      <div className="text-3xl font-mono tabular-nums">{time.toLocaleTimeString('pt-BR', options)}</div>
      {showDate && <div className="text-sm text-muted-foreground capitalize">{time.toLocaleDateString('pt-BR', dateOptions)}</div>}
    </div>
  );
}

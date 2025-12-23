import React from 'react';
interface GaugeProps { value: number; min?: number; max?: number; label?: string; color?: string; }
export function Gauge({ value, min = 0, max = 100, label, color = '#3b82f6' }: GaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180;
  return (<div className="relative w-48 h-24 overflow-hidden"><svg viewBox="0 0 100 50" className="w-full h-full"><path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" /><path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${percentage * 1.26} 126`} /><text x="50" y="45" textAnchor="middle" className="text-2xl font-bold" fill="currentColor">{value}</text></svg>{label && <div className="text-center text-sm text-muted-foreground mt-1">{label}</div>}</div>);
}

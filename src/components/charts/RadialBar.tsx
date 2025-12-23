import React from 'react';
interface RadialBarProps { value: number; max?: number; size?: number; strokeWidth?: number; color?: string; label?: string; }
export function RadialBar({ value, max = 100, size = 120, strokeWidth = 10, color = '#3b82f6', label }: RadialBarProps) {
  const radius = (size - strokeWidth) / 2; const circumference = 2 * Math.PI * radius; const progress = (value / max) * circumference;
  return (<div className="relative" style={{ width: size, height: size }}><svg width={size} height={size} className="-rotate-90"><circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold">{value}</span>{label && <span className="text-xs text-muted-foreground">{label}</span>}</div></div>);
}

import React from 'react';
interface FunnelStep { name: string; value: number; color?: string; }
interface FunnelProps { data: FunnelStep[]; width?: number; height?: number; }
export function Funnel({ data, width = 300, height = 400 }: FunnelProps) {
  const max = data[0]?.value || 1;
  const stepHeight = height / data.length;
  return (<div className="flex flex-col items-center" style={{ width }}>{data.map((step, i) => { const w = (step.value / max) * width; const nextW = data[i + 1] ? (data[i + 1].value / max) * width : w * 0.8; return (<div key={i} className="relative flex items-center justify-center text-white text-sm font-medium" style={{ width: w, height: stepHeight, backgroundColor: step.color || `hsl(${200 + i * 20}, 70%, 50%)`, clipPath: `polygon(0 0, 100% 0, ${50 + (nextW/w)*50}% 100%, ${50 - (nextW/w)*50}% 100%)` }}>{step.name}: {step.value}</div>); })}</div>);
}

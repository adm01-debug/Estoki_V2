import React from 'react';
interface SparklineProps { data: number[]; width?: number; height?: number; color?: string; showArea?: boolean; }
export function Sparkline({ data, width = 100, height = 30, color = '#3b82f6', showArea = false }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (<svg width={width} height={height} className="inline-block">{showArea && <polygon points={areaPoints} fill={color} fillOpacity={0.2} />}<polyline points={points} fill="none" stroke={color} strokeWidth={1.5} /></svg>);
}

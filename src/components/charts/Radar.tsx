import React from 'react';
interface RadarPoint { label: string; value: number; }
interface RadarProps { data: RadarPoint[]; size?: number; color?: string; max?: number; }
export function Radar({ data, size = 200, color = '#3b82f6', max = 100 }: RadarProps) {
  const cx = size / 2, cy = size / 2, r = size * 0.4; const angleStep = (2 * Math.PI) / data.length;
  const points = data.map((d, i) => { const angle = i * angleStep - Math.PI / 2; const ratio = d.value / max; return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle), label: d.label, lx: cx + (r + 20) * Math.cos(angle), ly: cy + (r + 20) * Math.sin(angle) }; });
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  return (<svg width={size} height={size}>{[0.25, 0.5, 0.75, 1].map(ratio => <polygon key={ratio} points={data.map((_, i) => { const angle = i * angleStep - Math.PI / 2; return `${cx + r * ratio * Math.cos(angle)},${cy + r * ratio * Math.sin(angle)}`; }).join(' ')} fill="none" stroke="#e5e7eb" />)}<polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={2} />{points.map((p, i) => <text key={i} x={p.lx} y={p.ly} textAnchor="middle" fontSize={10}>{p.label}</text>)}</svg>);
}

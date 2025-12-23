import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface TreemapItem { name: string; value: number; color?: string; }
interface TreemapProps { data: TreemapItem[]; width?: number; height?: number; }
export function Treemap({ data, width = 400, height = 300 }: TreemapProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let x = 0;
  const rects = data.map((item, i) => { const w = (item.value / total) * width; const rect = { ...item, x, width: w }; x += w; return rect; });
  return (<TooltipProvider><svg width={width} height={height}>{rects.map((r, i) => <Tooltip key={i}><TooltipTrigger asChild><g><rect x={r.x} y={0} width={r.width} height={height} fill={r.color || `hsl(${i * 40}, 70%, 50%)`} stroke="#fff" strokeWidth={2} /><text x={r.x + r.width / 2} y={height / 2} textAnchor="middle" fill="#fff" fontSize={12}>{r.width > 40 ? r.name : ''}</text></g></TooltipTrigger><TooltipContent>{r.name}: {r.value}</TooltipContent></Tooltip>)}</svg></TooltipProvider>);
}

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface HeatmapProps { data: { x: string; y: string; value: number }[]; colorScale?: string[]; }
export function Heatmap({ data, colorScale = ['#f0fdf4', '#22c55e', '#15803d'] }: HeatmapProps) {
  const xLabels = [...new Set(data.map(d => d.x))], yLabels = [...new Set(data.map(d => d.y))];
  const max = Math.max(...data.map(d => d.value)), min = Math.min(...data.map(d => d.value));
  const getColor = (value: number) => { const ratio = (value - min) / (max - min || 1); const idx = Math.floor(ratio * (colorScale.length - 1)); return colorScale[idx]; };
  const getValue = (x: string, y: string) => data.find(d => d.x === x && d.y === y)?.value ?? 0;
  return (<TooltipProvider><div className="overflow-auto"><table className="border-collapse"><thead><tr><th></th>{xLabels.map(x => <th key={x} className="p-1 text-xs rotate-45 origin-left">{x}</th>)}</tr></thead><tbody>{yLabels.map(y => <tr key={y}><td className="p-1 text-xs text-right pr-2">{y}</td>{xLabels.map(x => { const v = getValue(x, y); return <Tooltip key={x}><TooltipTrigger asChild><td className="w-6 h-6 border" style={{ backgroundColor: getColor(v) }} /></TooltipTrigger><TooltipContent>{v}</TooltipContent></Tooltip>; })}</tr>)}</tbody></table></div></TooltipProvider>);
}

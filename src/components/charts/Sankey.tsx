import React from 'react';
interface SankeyNode { id: string; name: string; }
interface SankeyLink { source: string; target: string; value: number; }
interface SankeyProps { nodes: SankeyNode[]; links: SankeyLink[]; width?: number; height?: number; }
export function Sankey({ nodes, links, width = 600, height = 400 }: SankeyProps) {
  const nodeHeight = height / (nodes.length + 1);
  const sourceNodes = nodes.slice(0, Math.ceil(nodes.length / 2));
  const targetNodes = nodes.slice(Math.ceil(nodes.length / 2));
  return (
    <svg width={width} height={height} className="overflow-visible">
      {sourceNodes.map((node, i) => <g key={node.id}><rect x={0} y={i * nodeHeight + nodeHeight / 2} width={100} height={nodeHeight * 0.8} fill="#3b82f6" rx={4} /><text x={50} y={i * nodeHeight + nodeHeight} textAnchor="middle" className="text-xs fill-white">{node.name}</text></g>)}
      {targetNodes.map((node, i) => <g key={node.id}><rect x={width - 100} y={i * nodeHeight + nodeHeight / 2} width={100} height={nodeHeight * 0.8} fill="#10b981" rx={4} /><text x={width - 50} y={i * nodeHeight + nodeHeight} textAnchor="middle" className="text-xs fill-white">{node.name}</text></g>)}
      {links.map((link, i) => {
        const sourceIdx = sourceNodes.findIndex(n => n.id === link.source);
        const targetIdx = targetNodes.findIndex(n => n.id === link.target);
        if (sourceIdx < 0 || targetIdx < 0) return null;
        const y1 = sourceIdx * nodeHeight + nodeHeight;
        const y2 = targetIdx * nodeHeight + nodeHeight;
        return <path key={i} d={`M 100 ${y1} C ${width / 2} ${y1}, ${width / 2} ${y2}, ${width - 100} ${y2}`} fill="none" stroke="#94a3b8" strokeWidth={Math.max(2, link.value / 10)} strokeOpacity={0.5} />;
      })}
    </svg>
  );
}

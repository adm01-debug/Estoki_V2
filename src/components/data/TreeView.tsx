import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
interface TreeNode { id: string; label: string; children?: TreeNode[]; }
interface TreeViewProps { data: TreeNode[]; onSelect?: (node: TreeNode) => void; }
export function TreeView({ data, onSelect }: TreeViewProps) {
  return <div className="space-y-1">{data.map(node => <TreeNodeItem key={node.id} node={node} onSelect={onSelect} />)}</div>;
}
function TreeNodeItem({ node, onSelect, level = 0 }: { node: TreeNode; onSelect?: (node: TreeNode) => void; level?: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div style={{ paddingLeft: level * 16 }}>
      <div className="flex items-center gap-1 p-1 hover:bg-accent rounded cursor-pointer" onClick={() => { hasChildren && setExpanded(!expanded); onSelect?.(node); }}>
        {hasChildren ? (expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <span className="w-4" />}
        <span>{node.label}</span>
      </div>
      {expanded && hasChildren && node.children!.map(child => <TreeNodeItem key={child.id} node={child} onSelect={onSelect} level={level + 1} />)}
    </div>
  );
}

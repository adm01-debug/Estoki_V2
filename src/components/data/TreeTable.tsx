import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
interface TreeNode { id: string; name: string; children?: TreeNode[]; [key: string]: any; }
interface TreeTableProps { data: TreeNode[]; columns: { key: string; header: string }[]; }
export function TreeTable({ data, columns }: TreeTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setExpanded(e => { const n = new Set(e); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const renderRows = (nodes: TreeNode[], level = 0): React.ReactNode[] => nodes.flatMap(node => [<TableRow key={node.id}><TableCell style={{ paddingLeft: `${level * 24 + 8}px` }} className="flex items-center gap-2">{node.children?.length ? <Button size="icon" variant="ghost" className="w-4 h-4" onClick={() => toggle(node.id)}>{expanded.has(node.id) ? <ChevronDown /> : <ChevronRight />}</Button> : <span className="w-4" />}{node.name}</TableCell>{columns.slice(1).map(col => <TableCell key={col.key}>{node[col.key]}</TableCell>)}</TableRow>, ...(expanded.has(node.id) && node.children ? renderRows(node.children, level + 1) : [])]);
  return (<Table><TableHeader><TableRow>{columns.map(col => <TableHead key={col.key}>{col.header}</TableHead>)}</TableRow></TableHeader><TableBody>{renderRows(data)}</TableBody></Table>);
}

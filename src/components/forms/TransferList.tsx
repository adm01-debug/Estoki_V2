import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
interface TransferListProps { sourceItems: { id: string; label: string }[]; targetItems?: { id: string; label: string }[]; onChange?: (source: string[], target: string[]) => void; }
export function TransferList({ sourceItems, targetItems = [], onChange }: TransferListProps) {
  const [source, setSource] = useState(sourceItems.map(i => i.id));
  const [target, setTarget] = useState(targetItems.map(i => i.id));
  const [selectedSource, setSelectedSource] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string[]>([]);
  const allItems = [...sourceItems, ...targetItems];
  const moveToTarget = () => { setTarget([...target, ...selectedSource]); setSource(source.filter(id => !selectedSource.includes(id))); setSelectedSource([]); onChange?.(source.filter(id => !selectedSource.includes(id)), [...target, ...selectedSource]); };
  const moveToSource = () => { setSource([...source, ...selectedTarget]); setTarget(target.filter(id => !selectedTarget.includes(id))); setSelectedTarget([]); onChange?.([...source, ...selectedTarget], target.filter(id => !selectedTarget.includes(id))); };
  const moveAllToTarget = () => { setTarget([...target, ...source]); onChange?.([], [...target, ...source]); setSource([]); };
  const moveAllToSource = () => { setSource([...source, ...target]); onChange?.([...source, ...target], []); setTarget([]); };
  const renderList = (ids: string[], selected: string[], setSelected: (s: string[]) => void) => (<ScrollArea className="h-[200px] border rounded-md p-2">{ids.map(id => { const item = allItems.find(i => i.id === id); return (<div key={id} className="flex items-center gap-2 py-1"><Checkbox checked={selected.includes(id)} onCheckedChange={c => setSelected(c ? [...selected, id] : selected.filter(s => s !== id))} /><span>{item?.label}</span></div>); })}</ScrollArea>);
  return (<div className="flex gap-4 items-center"><div className="flex-1">{renderList(source, selectedSource, setSelectedSource)}</div><div className="flex flex-col gap-1"><Button size="icon" variant="outline" onClick={moveAllToTarget}><ChevronsRight className="w-4 h-4" /></Button><Button size="icon" variant="outline" onClick={moveToTarget} disabled={!selectedSource.length}><ChevronRight className="w-4 h-4" /></Button><Button size="icon" variant="outline" onClick={moveToSource} disabled={!selectedTarget.length}><ChevronLeft className="w-4 h-4" /></Button><Button size="icon" variant="outline" onClick={moveAllToSource}><ChevronsLeft className="w-4 h-4" /></Button></div><div className="flex-1">{renderList(target, selectedTarget, setSelectedTarget)}</div></div>);
}

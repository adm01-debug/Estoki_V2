import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil } from 'lucide-react';
interface EditableTableProps<T> { data: T[]; columns: { key: keyof T; header: string; editable?: boolean }[]; onSave: (row: T) => void; }
export function EditableTable<T extends { id: string | number }>({ data, columns, onSave }: EditableTableProps<T>) {
  const [editingId, setEditingId] = useState<string | number | null>(null); const [editValues, setEditValues] = useState<Partial<T>>({});
  const startEdit = (row: T) => { setEditingId(row.id); setEditValues(row); };
  const cancelEdit = () => { setEditingId(null); setEditValues({}); };
  const saveEdit = () => { if (editingId) { onSave(editValues as T); setEditingId(null); setEditValues({}); } };
  return (<Table><TableHeader><TableRow>{columns.map(col => <TableHead key={String(col.key)}>{col.header}</TableHead>)}<TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{data.map(row => <TableRow key={row.id}>{columns.map(col => <TableCell key={String(col.key)}>{editingId === row.id && col.editable !== false ? <Input value={String(editValues[col.key] || '')} onChange={e => setEditValues(v => ({ ...v, [col.key]: e.target.value }))} /> : String(row[col.key])}</TableCell>)}<TableCell>{editingId === row.id ? <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={saveEdit}><Check className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button></div> : <Button size="icon" variant="ghost" onClick={() => startEdit(row)}><Pencil className="w-4 h-4" /></Button>}</TableCell></TableRow>)}</TableBody></Table>);
}

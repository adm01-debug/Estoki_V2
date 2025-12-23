import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
interface ComboboxProps { options: { value: string; label: string }[]; value?: string; onChange?: (value: string) => void; placeholder?: string; }
export function Combobox({ options, value, onChange, placeholder = 'Selecione...' }: ComboboxProps) {
  const [open, setOpen] = useState(false); const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);
  return (<Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Input value={selected?.label || ''} placeholder={placeholder} readOnly className="cursor-pointer" /></PopoverTrigger><PopoverContent className="p-0 w-full"><Command><CommandInput placeholder="Buscar..." value={search} onValueChange={setSearch} /><CommandList><CommandEmpty>Nenhum resultado</CommandEmpty><CommandGroup>{filtered.map(o => <CommandItem key={o.value} onSelect={() => { onChange?.(o.value); setOpen(false); }}>{o.label}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>);
}

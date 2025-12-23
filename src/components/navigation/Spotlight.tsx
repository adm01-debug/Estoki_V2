import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
interface SpotlightProps { isOpen: boolean; onClose: () => void; items: { id: string; label: string; onSelect: () => void }[]; placeholder?: string; }
export function Spotlight({ isOpen, onClose, items, placeholder = 'Search...' }: SpotlightProps) {
  const [query, setQuery] = useState('');
  const filtered = items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-lg">
        <Command>
          <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {filtered.map(item => (<CommandItem key={item.id} onSelect={() => { item.onSelect(); onClose(); }}>{item.label}</CommandItem>))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

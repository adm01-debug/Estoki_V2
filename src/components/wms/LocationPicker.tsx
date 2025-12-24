import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location { id: string; code: string; zone: string; aisle: string; level: number; status: 'available' | 'occupied' | 'reserved' | 'blocked'; }
interface LocationPickerProps { locations: Location[]; value?: string; onChange?: (locationId: string) => void; placeholder?: string; disabled?: boolean; filterStatus?: Location['status'][]; }

export function LocationPicker({ locations, value, onChange, placeholder = "Selecionar localização...", disabled, filterStatus }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const filteredLocations = filterStatus ? locations.filter(l => filterStatus.includes(l.status)) : locations;
  const selectedLocation = locations.find(l => l.id === value);
  const groupedLocations = filteredLocations.reduce((acc, loc) => { acc[loc.zone] = acc[loc.zone] || []; acc[loc.zone].push(loc); return acc; }, {} as Record<string, Location[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="w-full justify-between">
          {selectedLocation ? (<div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{selectedLocation.code}</span></div>) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar localização..." />
          <CommandList>
            <CommandEmpty>Nenhuma localização encontrada.</CommandEmpty>
            {Object.entries(groupedLocations).map(([zone, locs]) => (
              <CommandGroup key={zone} heading={`Zona ${zone}`}>
                {locs.map(loc => (
                  <CommandItem key={loc.id} value={loc.code} onSelect={() => { onChange?.(loc.id); setOpen(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", value === loc.id ? "opacity-100" : "opacity-0")} />
                    <span>{loc.code}</span>
                    <span className={cn("ml-auto text-xs", loc.status === 'available' ? 'text-green-500' : loc.status === 'occupied' ? 'text-blue-500' : 'text-yellow-500')}>{loc.status}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface SearchInputProps { value?: string; onChange?: (value: string) => void; onSearch?: (value: string) => void; label?: string; placeholder?: string; loading?: boolean; }
export function SearchInput({ value = '', onChange, onSearch, label, placeholder = 'Buscar...', loading = false }: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') onSearch?.(value); };
  const handleClear = () => { onChange?.(''); onSearch?.(''); };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={value} onChange={e => onChange?.(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="pl-10 pr-10" />
        {loading ? <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : value && <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10" onClick={handleClear}><X className="h-4 w-4" /></Button>}
      </div>
    </div>
  );
}

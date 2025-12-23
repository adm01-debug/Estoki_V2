import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Home, Settings, User, Mail, Phone, Calendar, Clock, Star, Heart, Check, X, Plus, Minus, Edit, Trash, Download, Upload, Share, Lock, Unlock, Eye, EyeOff, Bell, BellOff, Filter, List, Grid, Map, Image, File, Folder, Link, Tag, Bookmark, Flag, Info, AlertTriangle, AlertCircle, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
const ICONS = { Home, Settings, User, Mail, Phone, Calendar, Clock, Star, Heart, Check, X, Plus, Minus, Edit, Trash, Download, Upload, Share, Lock, Unlock, Eye, EyeOff, Bell, BellOff, Filter, List, Grid, Map, Image, File, Folder, Link, Tag, Bookmark, Flag, Info, AlertTriangle, AlertCircle, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight };
interface IconPickerProps { value?: string; onChange?: (iconName: string) => void; }
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const IconComponent = value ? ICONS[value as keyof typeof ICONS] : null;
  const filteredIcons = Object.entries(ICONS).filter(([name]) => name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start">{IconComponent ? <><IconComponent className="h-4 w-4 mr-2" />{value}</> : 'Selecionar ícone...'}</Button></PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="relative mb-2"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" /></div>
        <div className="grid grid-cols-8 gap-1 max-h-48 overflow-auto">{filteredIcons.map(([name, Icon]) => <Button key={name} variant={value === name ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => { onChange?.(name); setOpen(false); }}><Icon className="h-4 w-4" /></Button>)}</div>
      </PopoverContent>
    </Popover>
  );
}

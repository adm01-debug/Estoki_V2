import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface ColorInputProps { value?: string; onChange?: (color: string) => void; label?: string; showAlpha?: boolean; }
export function ColorInput({ value = '#3b82f6', onChange, label, showAlpha = false }: ColorInputProps) {
  const [mode, setMode] = useState<'hex' | 'rgb'>('hex');
  const hexToRgb = (hex: string) => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 }; };
  const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  const rgb = hexToRgb(value);
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2"><div className="w-10 h-10 rounded border" style={{ backgroundColor: value }} /><Input value={value} onChange={e => onChange?.(e.target.value)} className="flex-1 font-mono" maxLength={7} /></div>
      <Tabs value={mode} onValueChange={v => setMode(v as 'hex' | 'rgb')}>
        <TabsList className="grid grid-cols-2"><TabsTrigger value="hex">HEX</TabsTrigger><TabsTrigger value="rgb">RGB</TabsTrigger></TabsList>
        <TabsContent value="hex"><Input value={value} onChange={e => onChange?.(e.target.value)} placeholder="#000000" /></TabsContent>
        <TabsContent value="rgb" className="space-y-2">
          <div className="flex items-center gap-2"><span className="w-4 text-red-500">R</span><Slider value={[rgb.r]} max={255} onValueChange={([v]) => onChange?.(rgbToHex(v, rgb.g, rgb.b))} className="flex-1" /><span className="w-8 text-sm">{rgb.r}</span></div>
          <div className="flex items-center gap-2"><span className="w-4 text-green-500">G</span><Slider value={[rgb.g]} max={255} onValueChange={([v]) => onChange?.(rgbToHex(rgb.r, v, rgb.b))} className="flex-1" /><span className="w-8 text-sm">{rgb.g}</span></div>
          <div className="flex items-center gap-2"><span className="w-4 text-blue-500">B</span><Slider value={[rgb.b]} max={255} onValueChange={([v]) => onChange?.(rgbToHex(rgb.r, rgb.g, v))} className="flex-1" /><span className="w-8 text-sm">{rgb.b}</span></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

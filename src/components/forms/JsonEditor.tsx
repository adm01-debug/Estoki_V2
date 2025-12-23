import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
interface JsonEditorProps { value?: object; onChange?: (value: object) => void; }
export function JsonEditor({ value = {}, onChange }: JsonEditorProps) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);
  const handleChange = (v: string) => { setText(v); try { const parsed = JSON.parse(v); setError(null); onChange?.(parsed); } catch (e) { setError((e as Error).message); } };
  return (<div className="space-y-2"><Textarea value={text} onChange={e => handleChange(e.target.value)} className={`min-h-[200px] font-mono text-sm ${error ? 'border-red-500' : ''}`} spellCheck={false} />{error ? <div className="flex items-center gap-2 text-red-500 text-sm"><AlertCircle className="w-4 h-4" />{error}</div> : <div className="flex items-center gap-2 text-green-500 text-sm"><Check className="w-4 h-4" />JSON válido</div>}</div>);
}

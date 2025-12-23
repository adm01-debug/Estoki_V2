import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
interface CodeEditorProps { value?: string; onChange?: (value: string) => void; language?: string; }
export function CodeEditor({ value = '', onChange, language = 'javascript' }: CodeEditorProps) {
  const [content, setContent] = useState(value);
  const handleChange = (v: string) => { setContent(v); onChange?.(v); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Tab') { e.preventDefault(); const target = e.target as HTMLTextAreaElement; const start = target.selectionStart; const end = target.selectionEnd; const newValue = content.substring(0, start) + '  ' + content.substring(end); setContent(newValue); onChange?.(newValue); setTimeout(() => { target.selectionStart = target.selectionEnd = start + 2; }, 0); } };
  return (<div className="relative"><div className="absolute top-2 right-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{language}</div><Textarea value={content} onChange={e => handleChange(e.target.value)} onKeyDown={handleKeyDown} className="min-h-[300px] font-mono text-sm bg-slate-900 text-green-400" spellCheck={false} /></div>);
}

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, File, Image } from 'lucide-react';
interface FileDropzoneProps { onDrop: (files: File[]) => void; accept?: string; multiple?: boolean; maxSize?: number; maxFiles?: number; }
export function FileDropzone({ onDrop, accept, multiple = true, maxSize = 10 * 1024 * 1024, maxFiles = 10 }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(f => f.size <= maxSize).slice(0, maxFiles);
    setFiles(valid); onDrop(valid);
  };
  const removeFile = (index: number) => { const updated = files.filter((_, i) => i !== index); setFiles(updated); onDrop(updated); };
  return (
    <div className="space-y-4">
      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}>
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">Arraste arquivos aqui ou</p>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>Selecionar arquivos</Button>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
        <p className="text-xs text-muted-foreground mt-2">Máx: {(maxSize / 1024 / 1024).toFixed(0)}MB por arquivo</p>
      </div>
      {files.length > 0 && <div className="space-y-2">{files.map((f, i) => <div key={i} className="flex items-center gap-2 p-2 border rounded"><File className="h-4 w-4" /><span className="flex-1 text-sm truncate">{f.name}</span><span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)}KB</span><Button type="button" variant="ghost" size="icon" onClick={() => removeFile(i)}><X className="h-4 w-4" /></Button></div>)}</div>}
    </div>
  );
}

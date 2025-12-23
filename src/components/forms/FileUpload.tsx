import React, { useCallback, useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';
interface FileUploadProps { onUpload: (files: File[]) => void; accept?: string; multiple?: boolean; maxSize?: number; className?: string; }
export function FileUpload({ onUpload, accept, multiple, maxSize = 10 * 1024 * 1024, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.size <= maxSize);
    setFiles(droppedFiles); onUpload(droppedFiles);
  }, [maxSize, onUpload]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(f => f.size <= maxSize);
    setFiles(selectedFiles); onUpload(selectedFiles);
  };
  const removeFile = (index: number) => { const newFiles = files.filter((_, i) => i !== index); setFiles(newFiles); onUpload(newFiles); };
  return (
    <div className={cn('border-2 border-dashed rounded-lg p-6 text-center', isDragging && 'border-primary bg-primary/5', className)}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
      <input type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="cursor-pointer"><Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" /><p>Drag & drop or click to upload</p></label>
      {files.length > 0 && (<div className="mt-4 space-y-2">{files.map((file, i) => (<div key={i} className="flex items-center gap-2 p-2 bg-muted rounded"><File className="h-4 w-4" /><span className="flex-1 truncate">{file.name}</span><X className="h-4 w-4 cursor-pointer" onClick={() => removeFile(i)} /></div>))}</div>)}
    </div>
  );
}

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  className?: string;
}

export function FileUpload({ accept, multiple, maxSize = 10 * 1024 * 1024, onUpload, className }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.size <= maxSize);
    if (!multiple) dropped.splice(1);
    setFiles(prev => multiple ? [...prev, ...dropped] : dropped);
    onUpload(dropped);
  }, [multiple, maxSize, onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).filter(f => f.size <= maxSize);
    setFiles(prev => multiple ? [...prev, ...selected] : selected);
    onUpload(selected);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  return (
    <div className={className}>
      <div className={cn("border-2 border-dashed rounded-lg p-6 text-center transition-colors", dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25")} onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}>
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">Arraste arquivos ou</p>
        <Button variant="outline" size="sm" onClick={() => document.getElementById("file-input")?.click()}>Selecionar</Button>
        <input id="file-input" type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" />
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((file, i) => (
            <li key={i} className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1">
              <span className="truncate">{file.name}</span>
              <Button variant="ghost" size="icon" onClick={() => removeFile(i)}><X className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

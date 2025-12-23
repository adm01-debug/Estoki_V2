import { useState, useCallback, useRef } from 'react';
export function useFileDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const dragCounter = useRef(0);
  const onDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); dragCounter.current++; setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); }, []);
  const onDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); dragCounter.current = 0; setFiles(Array.from(e.dataTransfer.files)); }, []);
  return { isDragging, files, handlers: { onDragEnter, onDragLeave, onDragOver, onDrop }, clearFiles: () => setFiles([]) };
}

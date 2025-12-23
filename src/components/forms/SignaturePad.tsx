import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface SignaturePadProps { onSave: (dataUrl: string) => void; width?: number; height?: number; className?: string; }
export function SignaturePad({ onSave, width = 400, height = 200, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  }, [width, height]);
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => { setIsDrawing(true); const ctx = canvasRef.current?.getContext('2d'); if (ctx) { const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); } };
  const draw = (e: React.MouseEvent | React.TouchEvent) => { if (!isDrawing) return; const ctx = canvasRef.current?.getContext('2d'); if (ctx) { const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); } };
  const stopDrawing = () => setIsDrawing(false);
  const clear = () => { const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.fillStyle = 'white'; ctx.fillRect(0, 0, width, height); } };
  const save = () => { const dataUrl = canvasRef.current?.toDataURL(); if (dataUrl) onSave(dataUrl); };
  return (
    <div className={cn('space-y-2', className)}>
      <canvas ref={canvasRef} width={width} height={height} className="border rounded cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
      <div className="flex gap-2"><Button variant="outline" onClick={clear}>Clear</Button><Button onClick={save}>Save</Button></div>
    </div>
  );
}

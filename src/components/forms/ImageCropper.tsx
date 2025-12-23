import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
interface ImageCropperProps { src: string; onCrop: (blob: Blob) => void; onCancel: () => void; aspectRatio?: number; }
export function ImageCropper({ src, onCrop, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => { if (blob) onCrop(blob); }, 'image/jpeg', 0.9);
  }, [onCrop]);
  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        <img src={src} alt="Crop" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: 'center' }} className="w-full h-full object-contain" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2"><ZoomOut className="h-4 w-4" /><Slider value={[zoom]} min={0.5} max={3} step={0.1} onValueChange={([v]) => setZoom(v)} /><ZoomIn className="h-4 w-4" /></div>
        <div className="flex items-center gap-2"><RotateCw className="h-4 w-4" /><Slider value={[rotation]} min={0} max={360} step={1} onValueChange={([v]) => setRotation(v)} /></div>
      </div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={onCancel}><X className="h-4 w-4 mr-2" />Cancelar</Button><Button onClick={handleCrop}><Check className="h-4 w-4 mr-2" />Aplicar</Button></div>
    </div>
  );
}

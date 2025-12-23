import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
interface LightboxProps { images: string[]; initialIndex?: number; isOpen: boolean; onClose: () => void; }
export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white" onClick={onClose}><X /></Button>
        <div className="flex items-center justify-center h-full">
          <Button variant="ghost" size="icon" className="absolute left-2 text-white" onClick={prev}><ChevronLeft /></Button>
          <img src={images[index]} className="max-h-[85vh] max-w-[85vw] object-contain" />
          <Button variant="ghost" size="icon" className="absolute right-2 text-white" onClick={next}><ChevronRight /></Button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">{index + 1} / {images.length}</div>
      </DialogContent>
    </Dialog>
  );
}

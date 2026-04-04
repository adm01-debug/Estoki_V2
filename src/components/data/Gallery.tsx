import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
interface GalleryProps { images: { src: string; alt?: string }[]; columns?: number; }
export function Gallery({ images, columns = 3 }: GalleryProps) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {images.map((img, i) => (<img key={i} src={img.src} alt={img.alt || "Imagem"} loading="lazy" decoding="async" className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80" onClick={() => setSelected(i)} />))}
      </div>
      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl">{selected !== null && <img src={images[selected].src} alt={images[selected].alt} className="w-full" />}</DialogContent>
      </Dialog>
    </>
  );
}

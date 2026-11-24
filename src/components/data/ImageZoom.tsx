import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
interface ImageZoomProps {
  src: string;
  alt?: string;
  className?: string;
}
export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className + " cursor-zoom-in"}
        onClick={() => setIsOpen(true)}
      />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="max-h-[90vh] max-w-[90vw] overflow-auto"
        >
          <DialogTitle className="sr-only">Imagem ampliada</DialogTitle>
          <img
            src={src}
            alt={alt}
            style={{ transform: `scale(${scale})` }}
            onClick={() => setScale((s) => (s === 1 ? 2 : 1))}
            className="cursor-zoom-in transition-transform"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

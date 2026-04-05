import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { cn } from '@/lib/utils';

interface BarcodeDisplayProps { value: string; format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF14'; width?: number; height?: number; displayValue?: boolean; fontSize?: number; className?: string; }

export function BarcodeDisplay({ value, format = 'CODE128', width = 2, height = 100, displayValue = true, fontSize = 14, className }: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (svgRef.current && value) {
      try { JsBarcode(svgRef.current, value, { format, width, height, displayValue, fontSize, margin: 10 }); }
      catch (e) { if (import.meta.env.DEV) console.error('Barcode generation error:', e); }
    }
  }, [value, format, width, height, displayValue, fontSize]);
  return <svg ref={svgRef} className={cn("bg-white", className)} />;
}

import { useCallback } from 'react';
interface LabelData { sku: string; name: string; barcode: string; location?: string; lot?: string; quantity?: number; }
export function useLabelPrint() {
  const print = useCallback((labels: LabelData[], template: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = { small: { w: 50, h: 25 }, medium: { w: 100, h: 50 }, large: { w: 150, h: 100 } };
    const { w, h } = sizes[template];
    const html = labels.map(l => `<div style="width:${w}mm;height:${h}mm;border:1px solid #000;padding:2mm;margin:1mm;display:inline-block"><strong>${l.sku}</strong><br/>${l.name}<br/><code>${l.barcode}</code>${l.location ? `<br/>Loc: ${l.location}` : ''}${l.lot ? `<br/>Lote: ${l.lot}` : ''}</div>`).join('');
    const win = window.open(''); if (win) { win.document.write(`<html><body style="font-family:Arial;font-size:8pt">${html}</body></html>`); win.print(); win.close(); }
  }, []);
  return { print };
}

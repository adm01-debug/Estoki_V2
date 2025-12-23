import { useCallback } from 'react';
export function useBarcodePrint() {
  const print = useCallback((barcode: string, quantity = 1) => {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d')!;
    canvas.width = 200; canvas.height = 80; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 200, 80);
    ctx.fillStyle = '#000'; ctx.font = '14px monospace'; ctx.textAlign = 'center'; ctx.fillText(barcode, 100, 70);
    for (let i = 0; i < barcode.length; i++) { const x = 10 + i * 15; for (let j = 0; j < 50; j += 2) { if (Math.random() > 0.5) ctx.fillRect(x, j, 10, 2); } }
    const win = window.open(''); if (win) { for (let i = 0; i < quantity; i++) { win.document.write(`<img src="${canvas.toDataURL()}" /><br/>`); } win.print(); win.close(); }
  }, []);
  return { print };
}

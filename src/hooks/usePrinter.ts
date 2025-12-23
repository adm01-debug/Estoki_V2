import { useState, useCallback } from 'react';
interface PrinterConfig { name: string; type: 'thermal' | 'laser' | 'inkjet'; }
export function usePrinter() {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const print = useCallback((content: string, copies = 1) => { for (let i = 0; i < copies; i++) { const win = window.open(''); if (win) { win.document.write(content); win.print(); win.close(); } } }, []);
  const printRaw = useCallback(async (data: Uint8Array) => {
    try { const port = await navigator.serial.requestPort(); await port.open({ baudRate: 9600 }); const writer = port.writable?.getWriter(); if (writer) { await writer.write(data); writer.releaseLock(); } await port.close(); }
    catch (e) { console.error('Print failed:', e); }
  }, []);
  return { printers, selectedPrinter, setSelectedPrinter, print, printRaw };
}

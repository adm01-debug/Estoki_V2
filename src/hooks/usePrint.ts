import { useCallback, useRef } from 'react';

export function usePrint() {
  const printRef = useRef<HTMLElement | null>(null);

  const print = useCallback((elementId?: string) => {
    const element = elementId 
      ? document.getElementById(elementId) 
      : printRef.current;
    
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Impressão</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }, []);

  return { printRef, print };
}

export default usePrint;

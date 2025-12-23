import { useCallback } from 'react';
interface ShippingLabelData { trackingNumber: string; sender: { name: string; address: string; city: string; state: string; zip: string }; recipient: { name: string; address: string; city: string; state: string; zip: string }; weight?: number; carrier?: string; }
export function useShippingLabel() {
  const generate = useCallback((data: ShippingLabelData) => {
    const html = `<div style="width:4in;height:6in;border:2px solid #000;padding:10px;font-family:Arial">
      <div style="border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:10px"><strong>${data.carrier || 'CARRIER'}</strong><br/><code style="font-size:24px">${data.trackingNumber}</code></div>
      <div style="margin-bottom:20px"><strong>DE:</strong><br/>${data.sender.name}<br/>${data.sender.address}<br/>${data.sender.city}, ${data.sender.state} ${data.sender.zip}</div>
      <div style="font-size:18px"><strong>PARA:</strong><br/><strong>${data.recipient.name}</strong><br/>${data.recipient.address}<br/><strong>${data.recipient.city}, ${data.recipient.state} ${data.recipient.zip}</strong></div>
      ${data.weight ? `<div style="margin-top:20px">Peso: ${data.weight}kg</div>` : ''}</div>`;
    return html;
  }, []);
  const print = useCallback((data: ShippingLabelData) => { const html = generate(data); const win = window.open(''); if (win) { win.document.write(html); win.print(); win.close(); } }, [generate]);
  return { generate, print };
}

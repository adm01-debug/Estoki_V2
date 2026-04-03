import { useState, useCallback } from 'react';
import QRCode from 'qrcode';
export function useQRCode() {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const generate = useCallback(async (text: string, options?: any) => {
    try { const url = await QRCode.toDataURL(text, options); setQrDataUrl(url); return url; } catch (e) { console.error(e); return ''; }
  }, []);
  return { qrDataUrl, generate };
}

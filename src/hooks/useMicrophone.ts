import { useState, useCallback } from 'react';
export function useMicrophone() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const start = useCallback(async () => {
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); setStream(s); } 
    catch (e) { setError(e as Error); }
  }, []);
  const stop = useCallback(() => { stream?.getTracks().forEach(t => t.stop()); setStream(null); }, [stream]);
  return { stream, error, start, stop, isRecording: !!stream };
}

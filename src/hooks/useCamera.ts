import { useState, useCallback, useRef } from 'react';
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const start = useCallback(async (constraints?: MediaStreamConstraints) => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, ...constraints });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) { setError(e as Error); }
  }, []);
  const stop = useCallback(() => { stream?.getTracks().forEach(t => t.stop()); setStream(null); }, [stream]);
  return { stream, error, videoRef, start, stop };
}

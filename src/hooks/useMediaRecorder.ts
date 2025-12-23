import { useState, useRef, useCallback } from 'react';
export function useMediaRecorder(stream: MediaStream | null, mimeType = 'audio/webm') {
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const start = useCallback(() => {
    if (!stream) return;
    recorder.current = new MediaRecorder(stream, { mimeType });
    recorder.current.ondataavailable = (e) => setChunks(c => [...c, e.data]);
    recorder.current.start();
    setIsRecording(true);
  }, [stream, mimeType]);
  const stop = useCallback(() => { recorder.current?.stop(); setIsRecording(false); }, []);
  const getBlob = useCallback(() => new Blob(chunks, { type: mimeType }), [chunks, mimeType]);
  return { start, stop, isRecording, chunks, getBlob };
}

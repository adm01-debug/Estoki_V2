import { useState, useCallback, useRef, useEffect } from 'react';
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<any>(null);
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) { recognition.current = new SR(); recognition.current.continuous = true; recognition.current.onresult = (e: any) => setTranscript(e.results[e.results.length - 1][0].transcript); }
  }, []);
  const start = useCallback(() => { recognition.current?.start(); setIsListening(true); }, []);
  const stop = useCallback(() => { recognition.current?.stop(); setIsListening(false); }, []);
  return { transcript, isListening, start, stop, isSupported: !!recognition.current };
}

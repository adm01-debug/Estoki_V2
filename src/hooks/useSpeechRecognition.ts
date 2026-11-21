import { useState, useCallback, useRef, useEffect } from "react";
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognition = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognition.current = new SR();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = "pt-BR";
      recognition.current.onresult = (e: any) =>
        setTranscript(e.results[e.results.length - 1][0].transcript);
      recognition.current.onend = () => setIsListening(false);
      setIsSupported(true);
    }
  }, []);

  const start = useCallback(() => {
    try {
      recognition.current?.start();
      setIsListening(true);
    } catch {
      // Reconhecimento já iniciado (browsers lançam exceção) — mantém ativo.
    }
  }, []);

  const stop = useCallback(() => {
    recognition.current?.stop();
    setIsListening(false);
  }, []);

  return { transcript, isListening, start, stop, isSupported };
}

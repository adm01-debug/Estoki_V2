import { useCallback } from 'react';
export function useSpeechSynthesis() {
  const speak = useCallback((text: string, lang = 'pt-BR') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  }, []);
  const cancel = useCallback(() => speechSynthesis.cancel(), []);
  const pause = useCallback(() => speechSynthesis.pause(), []);
  const resume = useCallback(() => speechSynthesis.resume(), []);
  return { speak, cancel, pause, resume, isSpeaking: speechSynthesis.speaking };
}

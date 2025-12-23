import { useState, useCallback } from 'react';
export function useFileReader() {
  const [content, setContent] = useState<string | ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const readAsText = useCallback((file: File) => {
    setIsLoading(true); const reader = new FileReader();
    reader.onload = () => { setContent(reader.result); setIsLoading(false); };
    reader.onerror = () => { setError(new Error('Failed to read file')); setIsLoading(false); };
    reader.readAsText(file);
  }, []);
  const readAsDataURL = useCallback((file: File) => {
    setIsLoading(true); const reader = new FileReader();
    reader.onload = () => { setContent(reader.result); setIsLoading(false); };
    reader.onerror = () => { setError(new Error('Failed to read file')); setIsLoading(false); };
    reader.readAsDataURL(file);
  }, []);
  return { content, isLoading, error, readAsText, readAsDataURL };
}

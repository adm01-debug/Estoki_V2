import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export function useClipboardAdvanced() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = useCallback(async (text: string, showToast = true) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (showToast) toast({ title: 'Copiado!', description: text.substring(0, 50) });
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, [toast]);

  const paste = useCallback(async () => {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return null;
    }
  }, []);

  return { copy, paste, copied };
}

export default useClipboardAdvanced;

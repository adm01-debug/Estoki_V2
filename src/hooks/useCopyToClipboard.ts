import { useState, useCallback } from 'react';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      if (import.meta.env.DEV) console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy] as const;
}

export default useCopyToClipboard;

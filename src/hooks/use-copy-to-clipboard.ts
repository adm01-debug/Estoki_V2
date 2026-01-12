import { useState, useCallback } from 'react';

interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  error: Error | null;
}

export function useCopyToClipboard(timeout = 2000): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard API not available'));
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), timeout);
      return true;
    } catch (err) {
      setError(err as Error);
      setCopied(false);
      return false;
    }
  }, [timeout]);

  return { copied, copy, error };
}

export default useCopyToClipboard;

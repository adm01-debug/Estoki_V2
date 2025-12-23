import { useCallback } from 'react';
export function useShare() {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const share = useCallback(async (data: ShareData) => {
    if (!canShare) throw new Error('Share not supported');
    await navigator.share(data);
  }, [canShare]);
  return { share, canShare };
}

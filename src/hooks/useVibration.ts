import { useCallback } from 'react';

export function useVibration() {
  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const vibrateSuccess = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const vibrateError = useCallback(() => vibrate([300, 100, 300]), [vibrate]);
  const vibrateNotification = useCallback(() => vibrate(100), [vibrate]);

  return { vibrate, vibrateSuccess, vibrateError, vibrateNotification };
}

export default useVibration;

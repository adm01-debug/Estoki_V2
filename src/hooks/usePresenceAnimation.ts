import { useState, useCallback, useEffect } from 'react';
export function usePresenceAnimation(isVisible: boolean, duration = 300) {
  const [isPresent, setIsPresent] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (isVisible) { setIsPresent(true); setIsAnimating(true); setTimeout(() => setIsAnimating(false), duration); }
    else { setIsAnimating(true); setTimeout(() => { setIsPresent(false); setIsAnimating(false); }, duration); }
  }, [isVisible, duration]);
  return { isPresent, isAnimating };
}

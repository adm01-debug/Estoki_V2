import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Enables swipe-from-left-edge gesture to navigate back on mobile.
 * Only activates on touch devices, with swipe starting from the left 30px edge.
 */
export function useSwipeBack(enabled = true) {
  const navigate = useNavigate();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only track swipes starting from the left edge (30px)
      if (touch.clientX <= 30) {
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
      } else {
        touchStartX.current = -1;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current < 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);

      // Require horizontal swipe > 80px, with vertical movement < 50px
      if (deltaX > 80 && deltaY < 50) {
        navigate(-1);
      }

      touchStartX.current = -1;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, navigate]);
}

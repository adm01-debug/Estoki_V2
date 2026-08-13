import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Hook to guard navigation when there are unsaved changes.
 * Shows a confirmation dialog before leaving the page.
 */
export function useNavigationGuard(isDirty: boolean) {
  const [showDialog, setShowDialog] = useState(false);
  const proceedRef = useRef<(() => void) | null>(null);

  // Block navigation via react-router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowDialog(true);
    }
  }, [blocker.state]);

  // Block browser back/refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const confirm = useCallback(() => {
    setShowDialog(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  }, [blocker]);

  const cancel = useCallback(() => {
    setShowDialog(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }, [blocker]);

  return { showDialog, confirm, cancel };
}

import { useState, useCallback, useEffect } from "react";

type WakeLockSentinel = {
  release: () => Promise<void>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const request = useCallback(async () => {
    try {
      const lock = await (navigator as WakeLockNavigator).wakeLock?.request("screen");
      if (!lock) return;
      setWakeLock(lock);
    } catch {
      // Wake lock not supported or denied
    }
  }, []);
  const release = useCallback(async () => {
    await wakeLock?.release();
    setWakeLock(null);
  }, [wakeLock]);
  useEffect(
    () => () => {
      wakeLock?.release();
    },
    [wakeLock]
  );
  return { isLocked: !!wakeLock, request, release };
}

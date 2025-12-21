import { useState, useEffect, useCallback } from "react";

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback(({ key }: KeyboardEvent) => {
    if (key === targetKey) setKeyPressed(true);
  }, [targetKey]);

  const upHandler = useCallback(({ key }: KeyboardEvent) => {
    if (key === targetKey) setKeyPressed(false);
  }, [targetKey]);

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [downHandler, upHandler]);

  return keyPressed;
}

export function useHotkey(key: string, callback: () => void, deps: unknown[] = []) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key && !e.repeat) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, ...deps]);
}

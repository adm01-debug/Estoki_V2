import { useRef, useCallback } from "react";

export function useFocus<T extends HTMLElement>(): [React.RefObject<T>, () => void] {
  const ref = useRef<T>(null);
  const setFocus = useCallback(() => ref.current?.focus(), []);
  return [ref, setFocus];
}

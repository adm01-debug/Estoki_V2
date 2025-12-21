import { useState, useCallback } from "react";

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const set = useCallback((v: boolean) => setValue(v), []);

  return [value, toggle, set];
}

export function useDisclosure(initialOpen = false) {
  const [isOpen, toggle, setIsOpen] = useToggle(initialOpen);

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  return { isOpen, toggle, open, close, setIsOpen };
}

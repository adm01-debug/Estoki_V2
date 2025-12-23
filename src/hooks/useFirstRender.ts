import { useRef } from 'react';
export function useFirstRender() {
  const first = useRef(true);
  if (first.current) { first.current = false; return true; }
  return false;
}
export default useFirstRender;

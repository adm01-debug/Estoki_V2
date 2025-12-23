import { useCallback, useState } from 'react';
export function useForceUpdate(): () => void {
  const [, setState] = useState({});
  return useCallback(() => setState({}), []);
}

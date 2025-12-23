import { useState, useCallback } from 'react';
const flags: Record<string, boolean> = {};
export function useFeatureFlag(flag: string, defaultValue = false) {
  const [enabled] = useState(flags[flag] ?? defaultValue);
  const isEnabled = useCallback(() => enabled, [enabled]);
  return { enabled, isEnabled };
}

import { useState, useCallback } from 'react';
export function useExperiment(experimentId: string, variants: string[]) {
  const [variant] = useState(() => {
    const stored = sessionStorage.getItem(\`exp_\${experimentId}\`);
    if (stored) return stored;
    const selected = variants[Math.floor(Math.random() * variants.length)];
    sessionStorage.setItem(\`exp_\${experimentId}\`, selected);
    return selected;
  });
  const track = useCallback((event: string) => { console.log('[Experiment]', experimentId, variant, event); }, [experimentId, variant]);
  return { variant, track, isVariant: (v: string) => variant === v };
}

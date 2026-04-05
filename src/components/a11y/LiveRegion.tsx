import React from 'react';
interface LiveRegionProps { children: React.ReactNode; 'aria-live'?: 'polite' | 'assertive' | 'off'; 'aria-atomic'?: boolean; 'aria-relevant'?: React.AriaAttributes['aria-relevant']; }
export function LiveRegion({ children, 'aria-live': ariaLive = 'polite', 'aria-atomic': ariaAtomic = true, 'aria-relevant': ariaRelevant = 'additions text' }: LiveRegionProps) {
  return (
    <div role="status" aria-live={ariaLive} aria-atomic={ariaAtomic} aria-relevant={ariaRelevant} style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
      {children}
    </div>
  );
}

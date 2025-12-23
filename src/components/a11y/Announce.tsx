import React from 'react';
interface AnnounceProps { message: string; politeness?: 'polite' | 'assertive'; }
export function Announce({ message, politeness = 'polite' }: AnnounceProps) {
  return <div role="status" aria-live={politeness} aria-atomic="true" className="sr-only">{message}</div>;
}

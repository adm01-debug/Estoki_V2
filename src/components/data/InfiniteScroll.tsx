import React, { useState, useEffect, useRef, useCallback } from 'react';
interface InfiniteScrollProps { loadMore: () => Promise<void>; hasMore: boolean; loader?: React.ReactNode; children: React.ReactNode; threshold?: number; }
export function InfiniteScroll({ loadMore, hasMore, loader, children, threshold = 100 }: InfiniteScrollProps) {
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < threshold) { setLoading(true); await loadMore(); setLoading(false); }
  }, [loading, hasMore, loadMore, threshold]);
  useEffect(() => { const el = containerRef.current; el?.addEventListener('scroll', handleScroll); return () => el?.removeEventListener('scroll', handleScroll); }, [handleScroll]);
  return <div ref={containerRef} style={{ overflow: 'auto', height: '100%' }}>{children}{loading && loader}</div>;
}

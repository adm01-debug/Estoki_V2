import React from 'react';
import { cn } from '@/lib/utils';
interface HighlightProps { children: string; query: string; className?: string; highlightClassName?: string; }
export function Highlight({ children, query, className, highlightClassName = 'bg-yellow-200' }: HighlightProps) {
  if (!query) return <span className={className}>{children}</span>;
  const parts = children.split(new RegExp(`(${query})`, 'gi'));
  return <span className={className}>{parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <mark key={i} className={highlightClassName}>{part}</mark> : part)}</span>;
}

import React from 'react';
import { cn } from '@/lib/utils';
interface BlockquoteProps { children: React.ReactNode; author?: string; source?: string; className?: string; }
export function Blockquote({ children, author, source, className }: BlockquoteProps) {
  return (
    <blockquote className={cn('border-l-4 border-primary pl-4 italic', className)}>
      <p className="text-lg">{children}</p>
      {(author || source) && (<footer className="mt-2 text-sm text-muted-foreground">{author && <span>— {author}</span>}{source && <cite>, {source}</cite>}</footer>)}
    </blockquote>
  );
}

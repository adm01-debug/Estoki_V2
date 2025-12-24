import React from 'react';
import { cn } from '@/lib/utils';
interface SkipLink { id: string; label: string; }
interface SkipLinksProps { links?: SkipLink[]; className?: string; }
const defaultLinks: SkipLink[] = [{ id: 'main-content', label: 'Pular para conteúdo principal' }, { id: 'main-navigation', label: 'Pular para navegação' }];
export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  return (
    <nav className={cn("skip-links", className)} aria-label="Links de atalho">
      {links.map(link => (
        <a key={link.id} href={`#${link.id}`} className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-primary">
          {link.label}
        </a>
      ))}
    </nav>
  );
}

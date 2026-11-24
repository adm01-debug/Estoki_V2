import React from "react";
import { cn } from "@/lib/utils";

interface SkipLink {
  id: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

/**
 * Alvos padrão: o `<main id="main-content">` e a navegação principal
 * (`<nav id="main-nav">`) do `AppLayout`. Ambos recebem `tabIndex={-1}` no
 * destino, senão o foco não se move em navegadores que só aplicam o hash.
 */
const defaultLinks: SkipLink[] = [
  { id: "main-content", label: "Pular para conteúdo principal" },
  { id: "main-nav", label: "Pular para navegação" },
];

export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  return (
    <nav className={cn("skip-links", className)} aria-label="Links de atalho">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg focus:ring-2 focus:ring-primary"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

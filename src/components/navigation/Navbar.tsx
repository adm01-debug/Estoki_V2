import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
interface NavbarProps { logo?: React.ReactNode; children?: React.ReactNode; className?: string; }
export function Navbar({ logo, children, className }: NavbarProps) {
  return (
    <nav className={cn('border-b bg-background', className)}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">{logo}<div className="hidden md:flex gap-6">{children}</div></div>
      </div>
    </nav>
  );
}
interface NavItemProps { href: string; children: React.ReactNode; active?: boolean; }
export function NavItem({ href, children, active }: NavItemProps) {
  return <Link to={href} className={cn('text-sm font-medium transition-colors hover:text-primary', active ? 'text-primary' : 'text-muted-foreground')}>{children}</Link>;
}

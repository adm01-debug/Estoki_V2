import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Package, Search, FileX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: 'default' | 'search' | 'error' | 'no-data';
  className?: string;
}

const variantIcons = { default: Inbox, search: Search, error: FileX, 'no-data': Package };

export function EmptyState({ icon, title, description, action, variant = 'default', className }: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4"><Icon className="h-8 w-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
      {action && <Button onClick={action.onClick} variant="outline">{action.label}</Button>}
    </div>
  );
}
export default EmptyState;

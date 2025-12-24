import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
interface EmptyStateProps { icon?: React.ReactNode; title: string; description?: string; action?: { label: string; onClick: () => void }; className?: string; }
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">{icon || <Inbox className="h-8 w-8 text-muted-foreground" />}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

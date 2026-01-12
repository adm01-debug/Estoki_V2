import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  actions?: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void; icon?: React.ElementType };
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, backUrl, actions, primaryAction, className, children }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className={cn('flex flex-col gap-4 pb-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backUrl && (
            <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.icon ? <primaryAction.icon className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
export default PageHeader;

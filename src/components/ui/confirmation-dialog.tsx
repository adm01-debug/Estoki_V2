import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, CheckCircle, Info, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'default' | 'destructive' | 'warning' | 'success';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  loading?: boolean;
}

const variantConfig: Record<ConfirmVariant, { icon: LucideIcon; iconClass: string; buttonVariant: 'default' | 'destructive' | 'outline' }> = {
  default: { icon: Info, iconClass: 'text-blue-500', buttonVariant: 'default' },
  destructive: { icon: Trash2, iconClass: 'text-red-500', buttonVariant: 'destructive' },
  warning: { icon: AlertTriangle, iconClass: 'text-yellow-500', buttonVariant: 'default' },
  success: { icon: CheckCircle, iconClass: 'text-green-500', buttonVariant: 'default' },
};

export function ConfirmationDialog({
  open, onOpenChange, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  onConfirm, onCancel, variant = 'default', icon, loading = false
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full bg-muted', config.iconClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          {description && <AlertDialogDescription className="mt-2">{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={config.buttonVariant} onClick={handleConfirm} disabled={loading}>
              {loading ? 'Processando...' : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook para usar confirmação
export function useConfirmation() {
  const [state, setState] = React.useState<{ open: boolean; props: Partial<ConfirmationDialogProps> }>({ open: false, props: {} });

  const confirm = (props: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        props: {
          ...props,
          onConfirm: async () => { await props.onConfirm?.(); resolve(true); },
          onCancel: () => { props.onCancel?.(); resolve(false); },
        },
      });
    });
  };

  const Dialog = () => (
    <ConfirmationDialog
      open={state.open}
      onOpenChange={(open) => setState((s) => ({ ...s, open }))}
      title={state.props.title || ''}
      {...state.props}
      onConfirm={state.props.onConfirm || (() => {})}
    />
  );

  return { confirm, Dialog };
}

export default ConfirmationDialog;

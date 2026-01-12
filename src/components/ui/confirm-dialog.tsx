import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  isLoading?: boolean;
}

const variantConfig = {
  default: { icon: Info, iconClass: 'text-blue-500', buttonClass: '' },
  destructive: { icon: Trash2, iconClass: 'text-red-500', buttonClass: 'bg-red-600 hover:bg-red-700' },
  warning: { icon: AlertTriangle, iconClass: 'text-yellow-500', buttonClass: 'bg-yellow-600 hover:bg-yellow-700' },
};

export function ConfirmDialog({ open, onOpenChange, onConfirm, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'default', isLoading = false }: ConfirmDialogProps) {
  const { icon: Icon, iconClass, buttonClass } = variantConfig[variant];
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full bg-muted', iconClass)}><Icon className="h-5 w-5" /></div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          {description && <AlertDialogDescription className="ml-12">{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading} className={buttonClass}>{isLoading ? 'Processando...' : confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export default ConfirmDialog;

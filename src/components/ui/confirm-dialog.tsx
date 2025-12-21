import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={cn(
              variant === "destructive" &&
                buttonVariants({ variant: "destructive" })
            )}
            disabled={loading}
          >
            {loading ? "Aguarde..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook para usar o dialog de forma declarativa
import { useState, useCallback } from "react";

export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    onConfirm: () => {},
  });

  const confirm = useCallback(
    (options: {
      title: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      return new Promise<boolean>((resolve) => {
        setState({
          open: true,
          ...options,
          onConfirm: () => {
            setState((s) => ({ ...s, open: false }));
            resolve(true);
          },
        });
      });
    },
    []
  );

  const Dialog = (
    <ConfirmDialog
      {...state}
      onOpenChange={(open) => setState((s) => ({ ...s, open }))}
    />
  );

  return { confirm, Dialog };
}

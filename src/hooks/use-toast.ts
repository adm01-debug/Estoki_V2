import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

// Região de anúncio única: o app usa sonner. Este módulo mantém a API antiga
// de `useToast()` funcionando para não reescrever 22 arquivos de uma vez.
export interface ToastInput {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive" | null;
  duration?: number;
}

function notify({ title, description, variant, duration }: ToastInput) {
  const message = title ?? description;
  const options = {
    description: title ? description : undefined,
    duration,
  };

  return variant === "destructive"
    ? sonnerToast.error(message, options)
    : sonnerToast(message, options);
}

export function useToast() {
  return { toast: notify, dismiss: sonnerToast.dismiss };
}

export const toast = notify;
export const dismiss = sonnerToast.dismiss;
import { toast } from "sonner";
import { logger } from "@/utils/logger";

/**
 * Standardized error handler for the Receiving module.
 * Logs the error and shows a user-friendly toast notification.
 */
export const handleReceivingError = (error: any, context: string) => {
  const message = error?.message || "Ocorreu um erro inesperado";
  logger.error(`[Receiving - ${context}]`, error);
  
  toast.error("Erro na Operação", {
    description: `${context}: ${message}`,
  });
  
  return error;
};

/**
 * Calculates receiving progress percentage.
 */
export const calculateReceivingProgress = (initial: number, current: number): number => {
  if (!initial || initial <= 0) return 0;
  return Math.min(100, (current / initial) * 100);
};

/**
 * Formats a date specifically for receiving display.
 */
export const formatReceivingDate = (dateString?: string | null): string => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

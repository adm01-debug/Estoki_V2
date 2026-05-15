import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Calcula quantos dias se passaram desde uma data até hoje.
 */
export function getDaysSince(date: string | Date | null | undefined): number {
  if (!date) return 0;
  return differenceInDays(new Date(), new Date(date));
}

/**
 * Formata uma data para o padrão brasileiro com horário opcional.
 */
export function formatFriendlyDate(date: string | Date | null | undefined, includeTime = true): string {
  if (!date) return "N/A";
  const pattern = includeTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";
  return format(new Date(date), pattern, { locale: ptBR });
}

/**
 * Retorna uma classe de cor baseada na idade do estoque (heatmap logic).
 */
export function getStockAgeColor(days: number): string {
  if (days > 60) return "text-destructive font-black";
  if (days > 30) return "text-warning font-bold";
  if (days > 15) return "text-primary font-medium";
  return "text-success font-normal";
}
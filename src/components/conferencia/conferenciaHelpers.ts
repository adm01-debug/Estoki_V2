import { StatusRecebimento } from "./types";

export const statusConfig: Record<StatusRecebimento, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "bg-muted" },
  em_transito: { label: "Em Trânsito", color: "bg-blue-500" },
  recebido: { label: "Recebido", color: "bg-yellow-500" },
  em_conferencia: { label: "Em Conferência", color: "bg-orange-500" },
  conferido: { label: "Conferido", color: "bg-green-500" },
  divergencia: { label: "Divergência", color: "bg-red-500" },
  cancelado: { label: "Cancelado", color: "bg-destructive" },
};

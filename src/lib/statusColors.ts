/**
 * Centralized status color mappings for the ESTOKI design system.
 * All components should import from here instead of defining inline.
 */

export type StatusVariant = "success" | "danger" | "warning" | "info" | "default";

/** Returns Tailwind classes for bg, text, and border based on status */
export function getStatusClasses(status: string): string {
  switch (status) {
    case "success":
    case "ok":
    case "aprovado":
    case "conferido":
    case "recebido":
      return "bg-success/10 text-success border-success/20";
    case "danger":
    case "divergencia":
    case "reprovado":
    case "cancelado":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "warning":
    case "aguardando":
    case "em_transito":
    case "pendente":
      return "bg-warning/10 text-warning border-warning/20";
    case "info":
    case "triagem":
    case "em_andamento":
      return "bg-info/10 text-info border-info/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/** Returns a human-readable label for common statuses */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    success: "Sucesso",
    ok: "OK",
    aprovado: "Aprovado",
    conferido: "Conferido",
    recebido: "Recebido",
    danger: "Erro",
    divergencia: "Divergência",
    reprovado: "Reprovado",
    cancelado: "Cancelado",
    warning: "Atenção",
    aguardando: "Aguardando",
    em_transito: "Em Trânsito",
    pendente: "Pendente",
    info: "Informação",
    triagem: "Triagem",
    em_andamento: "Em Andamento",
  };
  return labels[status] || status;
}

/** Maps a variant to icon background + text color classes */
export function getVariantClasses(variant: StatusVariant) {
  switch (variant) {
    case "success":
      return { bg: "bg-success/10", text: "text-success", border: "border-success/20" };
    case "danger":
      return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" };
    case "warning":
      return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" };
    case "info":
      return { bg: "bg-info/10", text: "text-info", border: "border-info/20" };
    default:
      return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
  }
}
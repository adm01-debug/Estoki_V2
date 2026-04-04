import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Search, Warehouse, FileText, ClipboardList, ArrowRight, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "compact";
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className,
  children,
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      isCompact ? "py-8 px-4" : "py-16 px-6",
      className
    )}>
      {/* Icon with ambient glow */}
      <div className="relative mb-5">
        <div className={cn(
          "rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center",
          isCompact ? "w-14 h-14" : "w-20 h-20"
        )}>
          <Icon className={cn(
            "text-primary/40",
            isCompact ? "h-7 w-7" : "h-10 w-10"
          )} />
        </div>
        <div className="absolute -inset-3 rounded-3xl bg-primary/5 blur-xl pointer-events-none" />
      </div>

      <h3 className={cn(
        "font-bold text-foreground mb-1.5",
        isCompact ? "text-sm" : "text-lg"
      )}>{title}</h3>

      <p className={cn(
        "text-muted-foreground max-w-md leading-relaxed",
        isCompact ? "text-xs" : "text-sm"
      )}>{description}</p>

      {children}

      <div className="flex items-center gap-3 mt-5">
        {action && (
          <Button onClick={action.onClick} size={isCompact ? "sm" : "default"} className="gap-2">
            {action.icon ? <action.icon className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" size={isCompact ? "sm" : "default"} onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Pre-configured empty state props for common modules */
export const emptyStates = {
  produtos: {
    icon: Package,
    title: "Nenhum produto cadastrado",
    description: "Comece cadastrando seu primeiro produto para gerenciar o estoque.",
  },
  triagem: {
    icon: Search,
    title: "Nenhuma triagem pendente",
    description: "Todas as triagens foram concluídas. Novos lotes aparecerão aqui automaticamente.",
  },
  estoque: {
    icon: Warehouse,
    title: "Estoque vazio",
    description: "Cadastre produtos e receba materiais para começar a gerenciar posições.",
  },
  relatorios: {
    icon: FileText,
    title: "Nenhum relatório gerado",
    description: "Gere relatórios para analisar a performance do seu armazém.",
  },
  atividades: {
    icon: ClipboardList,
    title: "Sem atividade recente",
    description: "As operações realizadas aparecerão aqui em tempo real.",
  },
  busca: {
    icon: Search,
    title: "Nenhum resultado encontrado",
    description: "Tente ajustar os filtros ou termos de busca para encontrar o que procura.",
  },
} as const;

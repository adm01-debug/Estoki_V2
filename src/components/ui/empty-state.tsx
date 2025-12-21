import { LucideIcon, PackageOpen, Search, FileX, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "search" | "error" | "inbox";
}

const variantIcons = {
  default: PackageOpen,
  search: Search,
  error: FileX,
  inbox: Inbox,
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Variantes pré-configuradas
export function NoResults({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="Nenhum resultado encontrado"
      description="Tente ajustar os filtros ou termos de busca"
      actionLabel={onClear ? "Limpar filtros" : undefined}
      onAction={onClear}
    />
  );
}

export function NoData({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      variant="default"
      title="Nenhum dado disponível"
      description="Comece adicionando seu primeiro item"
      actionLabel={onCreate ? "Criar novo" : undefined}
      onAction={onCreate}
    />
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Erro ao carregar dados"
      description="Ocorreu um erro inesperado. Tente novamente."
      actionLabel={onRetry ? "Tentar novamente" : undefined}
      onAction={onRetry}
    />
  );
}

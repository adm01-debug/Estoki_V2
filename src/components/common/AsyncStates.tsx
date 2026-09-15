import { Loader2, AlertCircle, PackageOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// ── Loading Skeleton for list pages ──
interface ListSkeletonProps {
  count?: number;
  showStats?: boolean;
}

export function ListSkeleton({ count = 5, showStats = true }: ListSkeletonProps) {
  return (
    <div className="animate-fade-in space-y-4 p-4">
      {showStats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-2 p-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Full-page loading spinner ──
interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Carregando..." }: PageLoaderProps) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ── Error state with retry ──
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Erro ao carregar dados.", onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <p className="font-medium text-foreground">Algo deu errado</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

// ── Empty state ──
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Não há dados para exibir no momento.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-muted p-3">
        {icon || <PackageOpen className="h-8 w-8 text-muted-foreground" />}
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

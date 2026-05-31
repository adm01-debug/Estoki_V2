import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { tipoIcons, tipoLabels } from "./movimentacaoHelpers";

interface MovimentacaoHistoricoProps {
  movimentacoes: any[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

export function MovimentacaoHistorico({
  movimentacoes,
  loading,
  error,
  searchTerm,
}: MovimentacaoHistoricoProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-1 h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span className="text-destructive">{error}</span>
      </div>
    );
  }

  if (movimentacoes.length === 0) {
    return (
      <div className="rounded-xl bg-muted/50 p-8 text-center">
        <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          {searchTerm ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movimentacoes.map((mov) => (
        <div
          key={mov.id}
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
        >
          <div className="mb-2 text-xs text-muted-foreground">
            {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{tipoIcons[mov.tipo] || "📦"}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">
                {tipoLabels[mov.tipo] || mov.tipo.toUpperCase()}
              </div>
              <div className="truncate text-sm">
                {mov.produto_nome || mov.descricao}
                {mov.quantidade > 0 && ` | ${mov.quantidade} un`}
              </div>
              {mov.localizacao && (
                <div className="mt-1 text-xs text-muted-foreground">📍 {mov.localizacao}</div>
              )}
              {mov.operador_nome && (
                <div className="text-xs text-muted-foreground">Por: {mov.operador_nome}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

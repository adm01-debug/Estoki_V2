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

export function MovimentacaoHistorico({ movimentacoes, loading, error, searchTerm }: MovimentacaoHistoricoProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span className="text-destructive">{error}</span>
      </div>
    );
  }

  if (movimentacoes.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          {searchTerm ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movimentacoes.map((mov) => (
        <div key={mov.id} className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
          <div className="text-xs text-muted-foreground mb-2">
            {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{tipoIcons[mov.tipo] || "📦"}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{tipoLabels[mov.tipo] || mov.tipo.toUpperCase()}</div>
              <div className="text-sm truncate">
                {mov.produto_nome || mov.descricao}
                {mov.quantidade > 0 && ` | ${mov.quantidade} un`}
              </div>
              {mov.localizacao && (
                <div className="text-xs text-muted-foreground mt-1">
                  📍 {mov.localizacao}
                </div>
              )}
              {mov.operador_nome && (
                <div className="text-xs text-muted-foreground">
                  Por: {mov.operador_nome}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

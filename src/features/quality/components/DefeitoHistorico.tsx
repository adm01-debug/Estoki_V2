import { AlertTriangle, TrendingUp, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TipoDefeito } from "@/types/estoque";

interface HistoricoDefeito {
  tipo: TipoDefeito;
  label: string;
  emoji: string;
  ocorrencias: number;
  ultimaOcorrencia: Date;
  percentualLotes: number; // % de lotes que tiveram esse defeito
}

interface DefeitoHistoricoProps {
  sku: string;
  produto: string;
  historico: HistoricoDefeito[];
  totalTriagens: number;
  className?: string;
}

// Dados mockados de histórico
export const mockHistoricoDefeitos: Record<string, { historico: HistoricoDefeito[]; totalTriagens: number }> = {
  "MOCHILA-EXEC-PRETA": {
    totalTriagens: 12,
    historico: [
      {
        tipo: "costura",
        label: "Costura defeituosa",
        emoji: "🧵",
        ocorrencias: 8,
        ultimaOcorrencia: new Date("2025-12-10"),
        percentualLotes: 66.7,
      },
      {
        tipo: "mancha",
        label: "Mancha/Sujeira",
        emoji: "🟤",
        ocorrencias: 4,
        ultimaOcorrencia: new Date("2025-12-05"),
        percentualLotes: 33.3,
      },
      {
        tipo: "componente_faltando",
        label: "Componente faltando",
        emoji: "❓",
        ocorrencias: 2,
        ultimaOcorrencia: new Date("2025-11-28"),
        percentualLotes: 16.7,
      },
    ],
  },
  "CANETA-METAL-PRATA": {
    totalTriagens: 8,
    historico: [
      {
        tipo: "arranhao",
        label: "Arranhão/Risco",
        emoji: "🔍",
        ocorrencias: 5,
        ultimaOcorrencia: new Date("2025-12-14"),
        percentualLotes: 62.5,
      },
      {
        tipo: "quebra",
        label: "Quebra/Rachadura",
        emoji: "💔",
        ocorrencias: 3,
        ultimaOcorrencia: new Date("2025-12-12"),
        percentualLotes: 37.5,
      },
    ],
  },
};

export function DefeitoHistorico({
  sku,
  produto,
  historico,
  totalTriagens,
  className,
}: DefeitoHistoricoProps) {
  if (historico.length === 0) {
    return (
      <div className={cn("bg-card rounded-xl p-4 border border-border", className)}>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            HISTÓRICO DE DEFEITOS
          </h3>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum defeito registrado anteriormente</p>
          <p className="text-xs mt-1">Este é o primeiro lote deste produto</p>
        </div>
      </div>
    );
  }

  // Ordena por frequência
  const defeitosOrdenados = [...historico].sort((a, b) => b.percentualLotes - a.percentualLotes);
  const defeitoMaisComum = defeitosOrdenados[0];
  const temDefeitoRecorrente = defeitoMaisComum.percentualLotes >= 50;

  return (
    <div className={cn("bg-card rounded-xl p-4 border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            HISTÓRICO DE DEFEITOS
          </h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {totalTriagens} triagens anteriores
        </Badge>
      </div>

      {/* Alerta de defeito recorrente */}
      {temDefeitoRecorrente && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-warning text-sm">
              Atenção: Defeito Recorrente Detectado
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-lg mr-1">{defeitoMaisComum.emoji}</span>
              <strong>{defeitoMaisComum.label}</strong> foi encontrado em{" "}
              <strong>{defeitoMaisComum.percentualLotes.toFixed(0)}%</strong> dos lotes anteriores.
              Verifique com atenção especial.
            </div>
          </div>
        </div>
      )}

      {/* Lista de defeitos históricos */}
      <div className="space-y-2">
        {defeitosOrdenados.map((defeito) => {
          const isRecorrente = defeito.percentualLotes >= 50;
          const isModerado = defeito.percentualLotes >= 25 && defeito.percentualLotes < 50;

          return (
            <div
              key={defeito.tipo}
              className={cn(
                "rounded-lg p-3 flex items-center justify-between",
                isRecorrente
                  ? "bg-warning/10 border border-warning/20"
                  : isModerado
                  ? "bg-muted/50"
                  : "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{defeito.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{defeito.label}</span>
                    {isRecorrente && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Recorrente
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Última: {defeito.ultimaOcorrencia.toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={cn(
                  "text-lg font-bold",
                  isRecorrente ? "text-warning" : "text-muted-foreground"
                )}>
                  {defeito.percentualLotes.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {defeito.ocorrencias} ocorrências
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de frequência visual */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Distribuição de defeitos</div>
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          {defeitosOrdenados.map((defeito, index) => (
            <div
              key={defeito.tipo}
              className={cn(
                "h-full transition-all",
                index === 0 ? "bg-warning" : index === 1 ? "bg-primary" : "bg-muted-foreground/50"
              )}
              style={{ width: `${(defeito.ocorrencias / defeitosOrdenados.reduce((a, d) => a + d.ocorrencias, 0)) * 100}%` }}
              title={`${defeito.label}: ${defeito.ocorrencias} ocorrências`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{defeitosOrdenados[0]?.label}</span>
          {defeitosOrdenados.length > 1 && <span>{defeitosOrdenados[defeitosOrdenados.length - 1]?.label}</span>}
        </div>
      </div>
    </div>
  );
}

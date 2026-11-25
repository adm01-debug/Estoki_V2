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

// Defeitos possíveis derivados do checklist de inspeção (eventos_triagem)
const DEFEITOS_PADRAO: Record<string, { label: string; emoji: string }> = {
  cor_diferente: { label: "Cor diferente", emoji: "🎨" },
  tamanho_errado: { label: "Tamanho errado", emoji: "📏" },
  mancha: { label: "Mancha/Sujeira", emoji: "🟤" },
  avaria: { label: "Avaria visível", emoji: "💥" },
  embalagem: { label: "Embalagem danificada", emoji: "📦" },
  componente_faltando: { label: "Componente faltando", emoji: "❓" },
  funcionalidade: { label: "Funcionalidade comprometida", emoji: "⚙️" },
  outro: { label: "Outro defeito", emoji: "⚠️" },
};

const NORMALIZA_OBS: Array<{ chaves: string[]; tipo: keyof typeof DEFEITOS_PADRAO }> = [
  { chaves: ["cor", "color"], tipo: "cor_diferente" },
  { chaves: ["tamanho", "dimens"], tipo: "tamanho_errado" },
  { chaves: ["suj", "mancha", "sujeira"], tipo: "mancha" },
  { chaves: ["avaria", "danific", "quebra", "risc"], tipo: "avaria" },
  { chaves: ["embalagem"], tipo: "embalagem" },
  { chaves: ["faltando", "incomplet", "componente"], tipo: "componente_faltando" },
  { chaves: ["funcion", "teste"], tipo: "funcionalidade" },
];

// Deriva histórico real de defeitos das triagens registradas para o produto (via SKU do lote).
export function derivaHistoricoDefeitos(
  triagens: Array<{
    resultado?: string | null;
    data_fim?: string | null;
    observacoes?: string | null;
    lotes?: { produtos?: { sku?: string } | null } | null;
  }>,
  sku: string
): { historico: HistoricoDefeito[]; totalTriagens: number } {
  const doProduto = triagens.filter((t) => t.lotes?.produtos?.sku === sku);
  const totalTriagens = doProduto.length;
  const contagem = new Map<string, { ocorrencias: number; ultima: Date | null }>();

  for (const t of doProduto) {
    // Só falhas contam como defeito histórico
    const falhou =
      t.resultado === "reprovado" ||
      t.resultado === "parcial" ||
      t.resultado === "conserto" ||
      t.resultado === "ressalva";
    if (!falhou) continue;

    const obs = (t.observacoes || "").toLowerCase();
    let tipo: keyof typeof DEFEITOS_PADRAO = "outro";
    for (const regra of NORMALIZA_OBS) {
      if (regra.chaves.some((k) => obs.includes(k))) {
        tipo = regra.tipo;
        break;
      }
    }

    const entry = contagem.get(tipo) || { ocorrencias: 0, ultima: null };
    entry.ocorrencias += 1;
    const data = t.data_fim ? new Date(t.data_fim) : null;
    if (data && (!entry.ultima || data > entry.ultima)) entry.ultima = data;
    contagem.set(tipo, entry);
  }

  const historico: HistoricoDefeito[] = Array.from(contagem.entries())
    .map(([tipo, c]) => ({
      tipo: tipo as TipoDefeito,
      label: DEFEITOS_PADRAO[tipo].label,
      emoji: DEFEITOS_PADRAO[tipo].emoji,
      ocorrencias: c.ocorrencias,
      ultimaOcorrencia: c.ultima || new Date(),
      percentualLotes: Math.round((c.ocorrencias / (totalTriagens || 1)) * 1000) / 10,
    }))
    .sort((a, b) => b.percentualLotes - a.percentualLotes);

  return { historico, totalTriagens };
}

export function DefeitoHistorico({
  sku,
  produto,
  historico,
  totalTriagens,
  className,
}: DefeitoHistoricoProps) {
  if (historico.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">HISTÓRICO DE DEFEITOS</h3>
        </div>
        <div className="py-6 text-center text-muted-foreground">
          <History className="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p className="text-sm">Nenhum defeito registrado anteriormente</p>
          <p className="mt-1 text-xs">Este é o primeiro lote deste produto</p>
        </div>
      </div>
    );
  }

  // Ordena por frequência
  const defeitosOrdenados = [...historico].sort((a, b) => b.percentualLotes - a.percentualLotes);
  const defeitoMaisComum = defeitosOrdenados[0];
  const temDefeitoRecorrente = defeitoMaisComum.percentualLotes >= 50;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">HISTÓRICO DE DEFEITOS</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {totalTriagens} triagens anteriores
        </Badge>
      </div>

      {/* Alerta de defeito recorrente */}
      {temDefeitoRecorrente && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <div className="text-sm font-medium text-warning">
              Atenção: Defeito Recorrente Detectado
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="mr-1 text-lg">{defeitoMaisComum.emoji}</span>
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
                "flex items-center justify-between rounded-lg p-3",
                isRecorrente
                  ? "border border-warning/20 bg-warning/10"
                  : isModerado
                    ? "bg-muted/50"
                    : "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{defeito.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{defeito.label}</span>
                    {isRecorrente && (
                      <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                        <TrendingUp className="mr-1 h-3 w-3" />
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
                <div
                  className={cn(
                    "text-lg font-bold",
                    isRecorrente ? "text-warning" : "text-muted-foreground"
                  )}
                >
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
      <div className="mt-4 border-t border-border pt-3">
        <div className="mb-2 text-xs text-muted-foreground">Distribuição de defeitos</div>
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          {defeitosOrdenados.map((defeito, index) => (
            <div
              key={defeito.tipo}
              className={cn(
                "h-full transition-all",
                index === 0 ? "bg-warning" : index === 1 ? "bg-primary" : "bg-muted-foreground/50"
              )}
              style={{
                width: `${(defeito.ocorrencias / defeitosOrdenados.reduce((a, d) => a + d.ocorrencias, 0)) * 100}%`,
              }}
              title={`${defeito.label}: ${defeito.ocorrencias} ocorrências`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{defeitosOrdenados[0]?.label}</span>
          {defeitosOrdenados.length > 1 && (
            <span>{defeitosOrdenados[defeitosOrdenados.length - 1]?.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}

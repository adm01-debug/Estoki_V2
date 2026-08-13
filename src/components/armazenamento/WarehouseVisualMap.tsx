import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, MapPin } from "lucide-react";

interface PosicaoSugerida {
  id: string;
  codigo: string;
  zona?: string;
  tipo: string;
  status: string;
  score: number;
  motivos: string[];
  rua: string;
  nivelNumero: number;
  coluna: number;
  ocupacaoAtual?: number;
  capacidadeMax?: number;
}

interface WarehouseVisualMapProps {
  ruas: string[];
  posicoesAgrupadas: Record<string, PosicaoSugerida[]>;
  posicaoSelecionada: PosicaoSugerida | null;
  top3: PosicaoSugerida[];
  onSelect: (pos: PosicaoSugerida) => void;
}

export function WarehouseVisualMap({
  ruas,
  posicoesAgrupadas,
  posicaoSelecionada,
  top3,
  onSelect,
}: WarehouseVisualMapProps) {
  // Get max level for height visualization
  const maxNivel = Math.max(
    ...Object.values(posicoesAgrupadas)
      .flat()
      .map((p) => p.nivelNumero),
    1
  );
  const niveis = Array.from({ length: maxNivel }, (_, i) => maxNivel - i); // Top down

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="border-b pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-primary" />
            Mapa Interativo do Armazém (3D View)
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              {Object.values(posicoesAgrupadas).flat().length} Posições
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-4">
        <div className="min-w-[600px] space-y-8">
          {ruas.map((rua) => (
            <div key={rua} className="space-y-2">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary" className="px-3 text-lg font-bold">
                  RUA {rua}
                </Badge>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Vertical Grid Representation (Levels x Columns) */}
              <div className="grid grid-cols-[3rem_1fr] gap-4">
                <div className="flex flex-col justify-around text-xs font-medium italic text-muted-foreground">
                  {niveis.map((n) => (
                    <span key={n} className="flex items-center gap-1">
                      Nível {n}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  {/* Columns */}
                  {Array.from(new Set(posicoesAgrupadas[rua].map((p) => p.coluna)))
                    .sort((a, b) => a - b)
                    .map((col) => (
                      <div key={col} className="flex flex-1 flex-col gap-1">
                        {niveis.map((nivel) => {
                          const p = posicoesAgrupadas[rua].find(
                            (pos) => pos.coluna === col && pos.nivelNumero === nivel
                          );
                          if (!p)
                            return (
                              <div
                                key={nivel}
                                className="h-10 rounded-sm border border-dashed border-border/50 bg-muted/20"
                              />
                            );

                          const isSugestao = top3.some((s) => s.id === p.id);
                          const isSelecionada = posicaoSelecionada?.id === p.id;
                          const disponivel = p.status === "livre";

                          return (
                            <TooltipProvider key={nivel}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    onClick={() => disponivel && onSelect(p)}
                                    className={`relative flex h-10 cursor-pointer items-center justify-center rounded-md border-2 text-xs font-bold transition-all ${
                                      !disponivel
                                        ? "cursor-not-allowed border-transparent bg-muted text-muted-foreground opacity-40"
                                        : isSelecionada
                                          ? "z-10 scale-105 border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                          : isSugestao
                                            ? "animate-pulse border-primary bg-primary/20 text-primary"
                                            : "border-green-200 bg-white text-slate-600 hover:border-primary/50 hover:bg-slate-50"
                                    } `}
                                  >
                                    {p.codigo.split("-").pop() || p.coluna}
                                    {isSugestao && !isSelecionada && (
                                      <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-bold">{p.codigo}</p>
                                    <p className="text-xs">Status: {p.status}</p>
                                    {isSugestao && (
                                      <p className="text-xs font-medium text-primary">
                                        Recomendação: {p.score}% Match
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                        <span className="mt-1 text-center text-[10px] font-semibold text-muted-foreground">
                          Col {col}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 rounded-lg border border-dashed bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-primary bg-primary" />
            <span className="text-xs font-medium">Selecionada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-primary bg-primary/20" />
            <span className="text-xs font-medium">Melhor Sugestão</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-green-200 bg-white" />
            <span className="text-xs font-medium">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted opacity-40" />
            <span className="text-xs font-medium">Ocupada / Indisponível</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <Info className="h-3 w-3" />
            Arraste para o lado para ver mais ruas
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

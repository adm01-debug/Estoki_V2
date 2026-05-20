import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, MapPin } from "lucide-react";

interface PosicaoSugerida {
  id: string;
  codigo: string;
  rua: string;
  nivelNumero: number;
  coluna: number;
  status: string;
  score: number;
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
  onSelect
}: WarehouseVisualMapProps) {
  // Get max level for height visualization
  const maxNivel = Math.max(...Object.values(posicoesAgrupadas).flat().map(p => p.nivelNumero), 1);
  const niveis = Array.from({ length: maxNivel }, (_, i) => maxNivel - i); // Top down

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Mapa Interativo do Armazém (3D View)
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {Object.values(posicoesAgrupadas).flat().length} Posições
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 overflow-x-auto">
        <div className="min-w-[600px] space-y-8">
          {ruas.map(rua => (
            <div key={rua} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="font-bold text-lg px-3">RUA {rua}</Badge>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              {/* Vertical Grid Representation (Levels x Columns) */}
              <div className="grid grid-cols-[3rem_1fr] gap-4">
                <div className="flex flex-col justify-around text-xs font-medium text-muted-foreground italic">
                  {niveis.map(n => (
                    <span key={n} className="flex items-center gap-1">
                      Nível {n}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  {/* Columns */}
                  {Array.from(new Set(posicoesAgrupadas[rua].map(p => p.coluna))).sort((a,b) => a-b).map(col => (
                    <div key={col} className="flex flex-col gap-1 flex-1">
                      {niveis.map(nivel => {
                        const p = posicoesAgrupadas[rua].find(pos => pos.coluna === col && pos.nivelNumero === nivel);
                        if (!p) return <div key={nivel} className="h-10 bg-muted/20 rounded-sm border border-dashed border-border/50" />;
                        
                        const isSugestao = top3.some(s => s.id === p.id);
                        const isSelecionada = posicaoSelecionada?.id === p.id;
                        const disponivel = p.status === 'livre';
                        
                        return (
                          <TooltipProvider key={nivel}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={() => disponivel && onSelect(p)}
                                  className={`
                                    h-10 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center text-xs font-bold relative
                                    ${!disponivel 
                                      ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-40" 
                                      : isSelecionada 
                                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-105 z-10" 
                                        : isSugestao 
                                          ? "bg-primary/20 text-primary border-primary animate-pulse" 
                                          : "bg-white text-slate-600 border-green-200 hover:border-primary/50 hover:bg-slate-50"}
                                  `}
                                >
                                  {p.codigo.split('-').pop() || p.coluna}
                                  {isSugestao && !isSelecionada && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-bold">{p.codigo}</p>
                                  <p className="text-xs">Status: {p.status}</p>
                                  {isSugestao && <p className="text-xs text-primary font-medium">Recomendação: {p.score}% Match</p>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                      <span className="text-[10px] text-center mt-1 font-semibold text-muted-foreground">Col {col}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg border border-dashed">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary border-2 border-primary" />
            <span className="text-xs font-medium">Selecionada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary" />
            <span className="text-xs font-medium">Melhor Sugestão</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border-2 border-green-200" />
            <span className="text-xs font-medium">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted opacity-40" />
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

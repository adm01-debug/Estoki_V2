import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, CheckCircle2, Zap, MapPin } from "lucide-react";

interface PosicaoSugerida {
  id: string; codigo: string; zona?: string; tipo: string; status: string; score: number; motivos: string[]; rua: string; nivelNumero: number; coluna: number;
}

const getScoreColor = (score: number) => score >= 150 ? "text-green-600" : score >= 120 ? "text-yellow-600" : "text-muted-foreground";

interface SugestaoCardProps {
  melhorSugestao: PosicaoSugerida;
  alternativas: PosicaoSugerida[];
  posicaoSelecionada: PosicaoSugerida | null;
  onSelect: (pos: PosicaoSugerida) => void;
  totalSugestoes: number;
}

export function SugestaoCard({ melhorSugestao, alternativas, posicaoSelecionada, onSelect, totalSugestoes }: SugestaoCardProps) {
  return (
    <>
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />Sugestão Automática</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${posicaoSelecionada?.id === melhorSugestao.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
            onClick={() => onSelect(melhorSugestao)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">{melhorSugestao.codigo}</div>
                <div>
                  <p className="font-semibold">Posição Recomendada</p>
                  <p className="text-sm text-muted-foreground">{melhorSugestao.rua} • Nível {melhorSugestao.nivelNumero} • Coluna {melhorSugestao.coluna}</p>
                </div>
              </div>
              <div className={`text-right ${getScoreColor(melhorSugestao.score)}`}>
                <Zap className="h-5 w-5 inline" /><span className="font-bold ml-1">{melhorSugestao.score}%</span>
              </div>
            </div>
            <div className="space-y-1">
              {melhorSugestao.motivos.slice(0, 3).map((motivo, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />{motivo}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {alternativas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-5 w-5" />Alternativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alternativas.map(pos => (
              <div
                key={pos.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${posicaoSelecionada?.id === pos.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                onClick={() => onSelect(pos)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-semibold text-sm">{pos.codigo}</div>
                    <div>
                      <p className="font-medium text-sm">{pos.rua} • Nível {pos.nivelNumero}</p>
                      <p className="text-xs text-muted-foreground">{pos.motivos[0]}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${getScoreColor(pos.score)}`}>{pos.score}%</span>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{totalSugestoes} posições disponíveis no total
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

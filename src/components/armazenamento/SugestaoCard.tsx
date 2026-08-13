import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, CheckCircle2, Zap, MapPin } from "lucide-react";

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
}

const getScoreColor = (score: number) =>
  score >= 150 ? "text-green-600" : score >= 120 ? "text-yellow-600" : "text-muted-foreground";

interface SugestaoCardProps {
  melhorSugestao: PosicaoSugerida;
  alternativas: PosicaoSugerida[];
  posicaoSelecionada: PosicaoSugerida | null;
  onSelect: (pos: PosicaoSugerida) => void;
  totalSugestoes: number;
}

export function SugestaoCard({
  melhorSugestao,
  alternativas,
  posicaoSelecionada,
  onSelect,
  totalSugestoes,
}: SugestaoCardProps) {
  return (
    <>
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-primary" />
            Sugestão Automática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${posicaoSelecionada?.id === melhorSugestao.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
            onClick={() => onSelect(melhorSugestao)}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                  {melhorSugestao.codigo}
                </div>
                <div>
                  <p className="font-semibold">Posição Recomendada</p>
                  <p className="text-sm text-muted-foreground">
                    {melhorSugestao.rua} • Nível {melhorSugestao.nivelNumero} • Coluna{" "}
                    {melhorSugestao.coluna}
                  </p>
                </div>
              </div>
              <div className={`text-right ${getScoreColor(melhorSugestao.score)}`}>
                <Zap className="inline h-5 w-5" />
                <span className="ml-1 font-bold">{melhorSugestao.score}%</span>
              </div>
            </div>
            <div className="space-y-1">
              {melhorSugestao.motivos.slice(0, 3).map((motivo, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                  {motivo}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {alternativas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5" />
              Alternativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alternativas.map((pos) => (
              <div
                key={pos.id}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${posicaoSelecionada?.id === pos.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                onClick={() => onSelect(pos)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-sm font-semibold">
                      {pos.codigo}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {pos.rua} • Nível {pos.nivelNumero}
                      </p>
                      <p className="text-xs text-muted-foreground">{pos.motivos[0]}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${getScoreColor(pos.score)}`}>{pos.score}%</span>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {totalSugestoes} posições disponíveis no total
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

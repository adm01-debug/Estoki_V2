import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Package, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingItem {
  operadorId: string;
  operadorNome: string;
  triagensRealizadas: number;
  aprovacaoMedia: number;
  xpTotal: number;
  nivel: number;
}

interface ProdutividadeRankingProps {
  ranking: RankingItem[];
}

const getInitials = (nome: string) => nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
const getMedalColor = (index: number) => {
  switch (index) { case 0: return "text-yellow-500"; case 1: return "text-gray-400"; case 2: return "text-amber-600"; default: return "text-muted-foreground"; }
};

export function ProdutividadeRanking({ ranking }: ProdutividadeRankingProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" />Ranking de Produtividade</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranking.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
          ) : ranking.map((op, index) => (
            <div key={op.operadorId} className={cn("flex items-center gap-4 p-3 rounded-lg border", index === 0 && "bg-yellow-500/5 border-yellow-500/30", index === 1 && "bg-gray-500/5 border-gray-500/30", index === 2 && "bg-amber-500/5 border-amber-500/30")}>
              <div className={cn("text-2xl font-bold w-8", getMedalColor(index))}>{index < 3 ? <Trophy className="h-6 w-6" /> : `#${index + 1}`}</div>
              <Avatar className="h-10 w-10"><AvatarFallback>{getInitials(op.operadorNome)}</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="font-semibold">{op.operadorNome}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" />{op.triagensRealizadas} triagens</span>
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" />{op.aprovacaoMedia.toFixed(1)}% aprovação</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary"><Zap className="h-4 w-4" /><span className="font-bold">{op.xpTotal} XP</span></div>
                <Badge variant="outline" className="text-xs">Nível {op.nivel}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

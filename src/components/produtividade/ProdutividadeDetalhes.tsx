import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, Star } from "lucide-react";

interface OperadorMetrica {
  operadorId: string;
  operadorNome: string;
  triagensRealizadas: number;
  tarefasConcluidas: number;
  aprovacaoMedia: number;
  tempoMedioTriagem: number;
  xpTotal: number;
  nivel: number;
}

interface ProdutividadeDetalhesProps {
  metricas: OperadorMetrica[];
}

export function ProdutividadeDetalhes({ metricas }: ProdutividadeDetalhesProps) {
  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (metricas.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>Nenhum dado de produtividade encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metricas.map((metrica) => (
        <Card key={metrica.operadorId}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(metrica.operadorNome)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{metrica.operadorNome}</CardTitle>
                  <p className="text-xs text-muted-foreground">Nível {metrica.nivel}</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                {metrica.xpTotal} XP
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Triagens</p>
                <p className="text-lg font-bold">{metrica.triagensRealizadas}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Tarefas</p>
                <p className="text-lg font-bold">{metrica.tarefasConcluidas}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aprovação</span>
                <span className="font-medium">{metrica.aprovacaoMedia.toFixed(1)}%</span>
              </div>
              <Progress value={metrica.aprovacaoMedia} className="h-2" />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tempo médio</span>
              <span className="font-medium">{metrica.tempoMedioTriagem.toFixed(1)} min</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

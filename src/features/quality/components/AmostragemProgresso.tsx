import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle } from "lucide-react";

interface AmostragemProgressoProps {
  status: string;
  itensVerificados: number;
  tamanhoAmostra: number;
  defeitosEncontrados: number;
  criterios: { aceite: number; rejeite: number };
}

export function AmostragemProgresso({
  status,
  itensVerificados,
  tamanhoAmostra,
  defeitosEncontrados,
  criterios
}: AmostragemProgressoProps) {
  const progresso = Math.min((itensVerificados / tamanhoAmostra) * 100, 100);

  return (
    <Card className={`border-2 ${
      status === "aprovado" ? "border-success/50 bg-success/5" :
      status === "rejeitado" ? "border-destructive/50 bg-destructive/5" :
      "border-primary/50"
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Amostragem em Andamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Progresso da Verificação</p>
            <p className="text-2xl font-bold">
              {itensVerificados} / {tamanhoAmostra}
            </p>
          </div>
          <Badge className={
            status === "aprovado" ? "bg-success" :
            status === "rejeitado" ? "bg-destructive" :
            status === "limite" ? "bg-warning" :
            "bg-primary"
          }>
            {status === "aprovado" ? "Aprovado" :
             status === "rejeitado" ? "Rejeitado" :
             status === "limite" ? "No Limite" :
             `${progresso.toFixed(0)}%`}
          </Badge>
        </div>
        
        <Progress value={progresso} className={
          status === "aprovado" ? "[&>div]:bg-success" :
          status === "rejeitado" ? "[&>div]:bg-destructive" : ""
        } />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-xs">Defeitos Encontrados</p>
            <p className={`font-bold text-lg ${
              defeitosEncontrados > criterios.rejeite ? "text-destructive" :
              defeitosEncontrados > criterios.aceite ? "text-warning" :
              "text-success"
            }`}>
              {defeitosEncontrados}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-xs">Critério</p>
            <p className="font-medium text-sm">
              Aceite: ≤{criterios.aceite} | Rejeite: ≥{criterios.rejeite}
            </p>
          </div>
        </div>

        {status === "aprovado" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Lote aprovado! Defeitos dentro do limite aceitável.
            </span>
          </div>
        )}

        {status === "rejeitado" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium">
              Lote rejeitado. Número de defeitos excede o limite.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

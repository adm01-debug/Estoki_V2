import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function MapaCalorOcupacao() {
  const zonas = [
    { nome: "ZONA A (Gravação)", ocupacao: 92, status: "crítico" },
    { nome: "ZONA B (Estoque Seco)", ocupacao: 45, status: "ideal" },
    { nome: "ZONA C (Manuseio)", ocupacao: 78, status: "alerta" },
    { nome: "ZONA D (Expedição)", ocupacao: 30, status: "livre" },
  ];

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/50 overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Zonas de Pressão (Calor)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {zonas.map((zona) => (
          <div key={zona.nome} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold">{zona.nome}</span>
              <div className="flex items-center gap-2">
                <span className={zona.ocupacao > 85 ? "text-destructive font-bold" : "text-muted-foreground"}>
                  {zona.ocupacao}%
                </span>
                {zona.ocupacao > 85 && <Badge variant="destructive" className="h-4 text-[9px] px-1 animate-pulse">OVERLOAD</Badge>}
              </div>
            </div>
            <Progress 
              value={zona.ocupacao} 
              className="h-1.5"
              style={{
                background: zona.ocupacao > 85 ? "rgba(239, 68, 68, 0.2)" : undefined
              }}
            />
          </div>
        ))}
        
        <div className="pt-2 flex items-start gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10">
          <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-primary">Sugestão:</span> Redirecionar novos volumes da Gravação para a Zona B para evitar gargalos na conferência.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

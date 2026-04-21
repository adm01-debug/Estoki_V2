import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fornecedor, ClassificacaoFornecedor } from "@/hooks/useFornecedores";

const classificacaoConfig: Record<ClassificacaoFornecedor, { color: string }> = {
  A: { color: "text-green-600" },
  B: { color: "text-blue-600" },
  C: { color: "text-amber-600" },
  D: { color: "text-red-600" },
};

interface Props {
  topFornecedores: Fornecedor[];
}

export function FornecedoresRanking({ topFornecedores }: Props) {
  return (
    <div className="space-y-3">
      {topFornecedores.map((f, index) => {
        const cls = classificacaoConfig[f.classificacao];
        return (
          <Card key={f.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{f.nome}</h3>
                    <Badge variant="outline" className={cls.color}>Classe {f.classificacao}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{f.entregas_totais} entregas • {f.itens_recebidos} itens</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{f.pontuacao.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

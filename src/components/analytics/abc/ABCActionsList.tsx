import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { ProdutoABC, ClassificacaoABC } from "@/features/analytics/hooks/useCurvaABC";

const curvaConfig: Record<ClassificacaoABC, { label: string }> = {
  A: { label: "Curva A" },
  B: { label: "Curva B" },
  C: { label: "Curva C" },
};

interface ABCActionsListProps {
  produtos: ProdutoABC[];
}

export function ABCActionsList({ produtos }: ABCActionsListProps) {
  const produtosComAcao = produtos.filter((p) => p.acao_sugerida);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Ações Sugeridas pelo Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {produtosComAcao.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500 opacity-50" />
            <p>Nenhuma ação pendente. Seu estoque está otimizado!</p>
          </div>
        ) : (
          produtosComAcao.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="bg-white dark:bg-background">
                    {curvaConfig[p.classificacao_final].label}
                  </Badge>
                  <span className="ml-2 font-mono text-sm font-semibold">{p.sku}</span>
                  <p className="mt-1 font-medium">{p.nome}</p>
                  <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                    {p.acao_sugerida}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/40"
                >
                  Resolver
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

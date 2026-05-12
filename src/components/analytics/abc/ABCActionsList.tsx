import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { ProdutoABC, ClassificacaoABC } from "@/hooks/useCurvaABC";

const curvaConfig: Record<ClassificacaoABC, { label: string }> = {
  A: { label: "Curva A" },
  B: { label: "Curva B" },
  C: { label: "Curva C" },
};

interface ABCActionsListProps {
  produtos: ProdutoABC[];
}

export function ABCActionsList({ produtos }: ABCActionsListProps) {
  const produtosComAcao = produtos.filter(p => p.acao_sugerida);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Ações Sugeridas pelo Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {produtosComAcao.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p>Nenhuma ação pendente. Seu estoque está otimizado!</p>
          </div>
        ) : (
          produtosComAcao.map((p) => (
            <div key={p.id} className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="bg-white dark:bg-background">{curvaConfig[p.classificacao_final].label}</Badge>
                  <span className="ml-2 font-mono text-sm font-semibold">{p.sku}</span>
                  <p className="font-medium mt-1">{p.nome}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 font-medium">{p.acao_sugerida}</p>
                </div>
                <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40">
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
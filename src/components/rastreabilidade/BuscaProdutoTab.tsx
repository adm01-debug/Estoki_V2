import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Package } from "lucide-react";
import { format } from "date-fns";
import { Movimentacao } from "@/hooks/useMovimentacoes";
import { tipoLabels, tipoIcons } from "./constants";

interface BuscaProdutoTabProps {
  onSearch: (id: string) => Promise<Movimentacao[]>;
}

export function BuscaProdutoTab({ onSearch }: BuscaProdutoTabProps) {
  const [produtoBusca, setProdutoBusca] = useState("");
  const [historicoProduto, setHistoricoProduto] = useState<Movimentacao[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleBuscarProduto = async () => {
    if (!produtoBusca.trim()) return;
    
    setBuscando(true);
    const historico = await onSearch(produtoBusca);
    setHistoricoProduto(historico);
    setBuscando(false);
    setHasSearched(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar Histórico de Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Digite o ID do produto..."
              value={produtoBusca}
              onChange={(e) => setProdutoBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBuscarProduto()}
              className="flex-1"
            />
            <Button onClick={handleBuscarProduto} disabled={buscando}>
              {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da busca */}
      {historicoProduto.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Histórico encontrado ({historicoProduto.length} movimentações)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historicoProduto.map((mov) => {
                const Icon = tipoIcons[mov.tipo];
                return (
                  <div key={mov.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <p className="font-medium">{tipoLabels[mov.tipo]}</p>
                        <p className="text-sm text-muted-foreground">
                          {mov.localizacao || mov.descricao}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>{mov.quantidade} un</p>
                      <p className="text-muted-foreground">
                        {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {historicoProduto.length === 0 && hasSearched && !buscando && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum histórico encontrado para "{produtoBusca}"</p>
        </div>
      )}
    </div>
  );
}

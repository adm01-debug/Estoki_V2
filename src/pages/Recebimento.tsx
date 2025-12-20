import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Package, ChevronRight, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRecebimentos } from "@/hooks/useRecebimentos";

export default function RecebimentoPage() {
  const navigate = useNavigate();
  const { recebimentos, loading, error } = useRecebimentos();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = recebimentos.filter((item) => {
    const matchesSearch =
      item.numero_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produto_nome.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AppLayout title="Recebimento" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Recebimento" showBack>
        <div className="p-4 text-center text-destructive">
          <p>Erro ao carregar recebimentos: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Recebimento"
      showBack
      rightAction={
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo</span>
        </Button>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lote, fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Recebimentos */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum recebimento encontrado</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/recebimento/${item.id}`)}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">
                        {item.numero_lote}
                      </span>
                      <Badge variant="outline">
                        Recebido
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{item.produto_nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.fornecedor}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">
                      {item.quantidade_atual}/{item.quantidade_inicial} un
                    </p>
                    {item.data_recebimento && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.data_recebimento)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

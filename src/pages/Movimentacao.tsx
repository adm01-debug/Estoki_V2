import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowRight, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TipoMovimentacao } from "@/types/movimentacao";

const TIPO_LABELS: Record<string, string> = {
  recebimento_nf: "Entrada (NF)",
  conferencia: "Conferência",
  triagem_inicio: "Triagem",
  triagem_fim: "Triagem Finalizada",
  armazenamento: "Alocação",
  transferencia: "Remanejamento",
  reserva: "Reserva",
  separacao: "Separação",
  conferencia_expedicao: "Conf. Expedição",
  carregamento: "Carregamento",
  saida_transporte: "Saída (Transporte)",
  entrega: "Entrega",
  devolucao: "Devolução",
  ajuste_estoque: "Ajuste",
};

const TIPO_ICONS: Record<string, string> = {
  recebimento_nf: "📥",
  conferencia: "✅",
  triagem_inicio: "🔍",
  triagem_fim: "✔️",
  armazenamento: "📍",
  transferencia: "🔄",
  reserva: "🔒",
  separacao: "📦",
  conferencia_expedicao: "📋",
  carregamento: "🚚",
  saida_transporte: "📤",
  entrega: "🎯",
  devolucao: "↩️",
  ajuste_estoque: "⚖️",
};

function tipoLabel(tipo: string) {
  return TIPO_LABELS[tipo] || tipo || "?";
}

function tipoIcon(tipo: string) {
  return TIPO_ICONS[tipo] || "📦";
}

export default function MovimentacaoPage() {
  const [activeTab, setActiveTab] = useState("historico");
  const [searchTerm, setSearchTerm] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("todos");

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["rastreamento_historico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rastreamento_historico")
        .select(`*, produtos(nome), lotes(numero_lote), profiles:operador_id(nome)`)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []).map((m: any) => ({
        id: m.id,
        tipo: m.tipo_evento,
        produto_nome: m.produtos?.nome || m.descricao || "?",
        lote_numero: m.lotes?.numero_lote,
        quantidade: m.quantidade || 0,
        localizacao: m.localizacao,
        descricao: m.descricao || "",
        operador_nome: m.profiles?.nome,
        created_at: m.created_at,
      }));
    },
  });

  const filteredMovimentacoes = useMemo(() => {
    let list = movimentacoes;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((m) =>
        (m.descricao || "").toLowerCase().includes(term) ||
        (m.produto_nome || "").toLowerCase().includes(term) ||
        (m.lote_numero || "").toLowerCase().includes(term) ||
        (m.localizacao || "").toLowerCase().includes(term)
      );
    }
    if (periodoFiltro !== "todos") {
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(dayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter((m) => {
        const d = new Date(m.created_at);
        if (periodoFiltro === "hoje") return d >= dayStart;
        if (periodoFiltro === "semana") return d >= weekStart;
        if (periodoFiltro === "mes") return d >= monthStart;
        return true;
      });
    }
    return list;
  }, [movimentacoes, searchTerm, periodoFiltro]);

  // Stats
  const stats = useMemo(() => {
    const entradas = movimentacoes.filter((m) =>
      ["recebimento_nf", "entrada_devolucao"].includes(m.tipo as string)
    ).length;
    const saidas = movimentacoes.filter((m) =>
      ["saida_transporte", "separacao"].includes(m.tipo as string)
    ).length;
    const remanejamentos = movimentacoes.filter((m) =>
      ["armazenamento", "transferencia"].includes(m.tipo as string)
    ).length;
    return { entradas, saidas, remanejamentos };
  }, [movimentacoes]);

  return (
    <AppLayout title="Movimentação" showBack>
      <div className="space-y-4 p-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 text-center">
            <div className="text-xs font-medium uppercase text-muted-foreground mb-1">Entradas</div>
            <div className="text-2xl font-bold text-green-600">{stats.entradas}</div>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <div className="text-xs font-medium uppercase text-muted-foreground mb-1">Saídas</div>
            <div className="text-2xl font-bold text-red-600">{stats.saidas}</div>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <div className="text-xs font-medium uppercase text-muted-foreground mb-1">Remanejamentos</div>
            <div className="text-2xl font-bold text-blue-600">{stats.remanejamentos}</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="historico" className="gap-2">
              <Clock className="h-4 w-4" />
              Histórico
              {movimentacoes.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">
                  {movimentacoes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historico" className="space-y-4 pt-4">
            {/* Filters */}
            <div className="flex gap-2">
              <Input
                placeholder="Buscar movimentação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mês</option>
              </select>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
                    <div className="h-3 w-24 bg-muted rounded mb-2" />
                    <div className="h-4 w-32 bg-muted rounded mb-1" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : filteredMovimentacoes.length === 0 ? (
              <div className="rounded-xl bg-muted/50 p-8 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMovimentacoes.map((mov) => (
                  <div
                    key={mov.id}
                    className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{tipoIcon(mov.tipo as string)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{tipoLabel(mov.tipo as string)}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {mov.produto_nome}
                          {mov.quantidade > 0 && ` · ${mov.quantidade} un`}
                        </div>
                        {mov.localizacao && (
                          <div className="text-xs text-muted-foreground">📍 {mov.localizacao}</div>
                        )}
                        {mov.operador_nome && (
                          <div className="text-xs text-muted-foreground">Por: {mov.operador_nome}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

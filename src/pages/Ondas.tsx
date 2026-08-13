import { OndasCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { NovoOndaDialog } from "@/components/ondas/NovoOndaDialog";
import { Download } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves,
  Search,
  Plus,
  Filter,
  Play,
  CheckCircle2,
  Clock,
  X,
  ListChecks,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pendente: { label: "Pendente", variant: "outline", icon: Clock },
  em_andamento: { label: "Em Andamento", variant: "default", icon: Play },
  concluida: { label: "Concluída", variant: "secondary", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", variant: "destructive", icon: X },
};

async function fetchOndas() {
  const { data, error } = await supabase
    .from("ondas_separacao")
    .select("*")
    .order("data_criacao", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function OndasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const queryClient = useQueryClient();

  const { data: ondas = [], isLoading: loading, error } = useQuery({
    queryKey: ["ondas-list"],
    queryFn: fetchOndas,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
  if (error) toast.error("Erro ao carregar ondas de separação");

  const reloadOndas = () => queryClient.invalidateQueries({ queryKey: ["ondas-list"] });

  const handleExportCSV = () => {
    const headers = [
      "Codigo",
      "Status",
      "Prioridade",
      "Descricao",
      "Zona",
      "Data Criacao",
      "Progresso",
    ];
    const rows = filtered.map((o) => {
      const progresso = o.total_tarefas
        ? Math.round(((o.tarefas_concluidas || 0) / o.total_tarefas) * 100)
        : 0;
      return [
        o.codigo,
        o.status,
        o.prioridade,
        o.descricao || "",
        o.zona_alvo || "",
        format(new Date(o.data_criacao), "yyyy-MM-dd HH:mm"),
        `${progresso}%`,
      ];
    });
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `ondas_estoki_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    return ondas.filter((o) => {
      const matchSearch =
        !search ||
        o.codigo.toLowerCase().includes(search.toLowerCase()) ||
        o.descricao?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [ondas, search, statusFilter]);

  const stats = useMemo(() => {
    const total = ondas.length;
    const pendentes = ondas.filter((o) => o.status === "pendente").length;
    const emAndamento = ondas.filter((o) => o.status === "em_andamento").length;
    const concluidas = ondas.filter((o) => o.status === "concluida").length;
    return { total, pendentes, emAndamento, concluidas };
  }, [ondas]);

  const handleIniciar = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ondas_separacao")
        .update({ status: "em_andamento", data_inicio: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Onda iniciada!");
      reloadOndas();
    } catch {
      toast.error("Erro ao iniciar onda");
    }
  };

  if (loading) {
    return (
      <AppLayout
        title="Ondas de Separação"
        showBack
        rightAction={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <NovoOndaDialog onSuccess={reloadOndas} />
          </div>
        }
      >
        <PageTransition>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <>
      <SEO title="Ondas de Separação" path="/ondas" description="Planejamento e execução de ondas de picking otimizadas por rota e zona." />
      <AppLayout title="Ondas de Separação" showBack>
      <PageTransition>
        <div className="space-y-4 p-4">
          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Waves className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{stats.emAndamento}</p>
                    <p className="text-xs text-muted-foreground">Em Andamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{stats.concluidas}</p>
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts */}
          {ondas.length > 0 && <OndasCharts ondas={ondas} />}

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar onda..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearch("")}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Waves List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Waves className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma onda encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filtered.map((onda, index) => {
                  const cfg = statusConfig[onda.status] || {
                    label: onda.status,
                    variant: "outline" as const,
                    icon: Clock,
                  };
                  const StatusIcon = cfg.icon;
                  const progresso = onda.total_tarefas
                    ? Math.round(((onda.tarefas_concluidas || 0) / onda.total_tarefas) * 100)
                    : 0;
                  return (
                    <motion.div
                      key={onda.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="transition-colors hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <div className="mb-1 flex items-center gap-2">
                                <p className="font-semibold">{onda.codigo}</p>
                                <Badge variant={cfg.variant}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {cfg.label}
                                </Badge>
                                {onda.prioridade === "urgente" && (
                                  <Badge variant="destructive">Urgente</Badge>
                                )}
                                {onda.prioridade === "alta" && (
                                  <Badge className="bg-warning text-warning-foreground">Alta</Badge>
                                )}
                              </div>
                              {onda.descricao && (
                                <p className="text-sm text-muted-foreground">{onda.descricao}</p>
                              )}
                              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                                {onda.zona_alvo && <span>Zona: {onda.zona_alvo}</span>}
                                {onda.rota && <span>Rota: {onda.rota}</span>}
                                <span>
                                  {format(new Date(onda.data_criacao), "dd/MM/yyyy HH:mm", {
                                    locale: ptBR,
                                  })}
                                </span>
                              </div>
                            </div>
                            {onda.status === "pendente" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleIniciar(onda.id)}
                              >
                                <Play className="h-3 w-3" /> Iniciar
                              </Button>
                            )}
                          </div>
                          {onda.total_tarefas > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <ListChecks className="h-3 w-3" /> {onda.tarefas_concluidas || 0}/
                                  {onda.total_tarefas} tarefas
                                </span>
                                <span>{progresso}%</span>
                              </div>
                              <Progress value={progresso} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </PageTransition>
    </AppLayout>
    </>
  );
}

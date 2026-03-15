// @ts-nocheck
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useTarefas, Tarefa, TipoTarefa, StatusTarefa, PrioridadeTarefa } from "@/hooks/useTarefas";
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin,
  TrendingUp,
  AlertCircle,
  Loader2,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const tipoLabels: Record<TipoTarefa, string> = {
  separacao: "Separação",
  armazenagem: "Armazenagem",
  transferencia: "Transferência",
  inventario: "Inventário",
  expedicao: "Expedição",
};

const statusLabels: Record<StatusTarefa, string> = {
  pendente: "Pendente",
  atribuida: "Atribuída",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  bloqueada: "Bloqueada",
};

const statusColors: Record<StatusTarefa, string> = {
  pendente: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  atribuida: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  em_andamento: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  concluida: "bg-green-500/10 text-green-600 border-green-500/30",
  bloqueada: "bg-red-500/10 text-red-600 border-red-500/30",
};

const prioridadeLabels: Record<PrioridadeTarefa, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const prioridadeColors: Record<PrioridadeTarefa, string> = {
  baixa: "bg-gray-500/10 text-gray-600",
  media: "bg-blue-500/10 text-blue-600",
  alta: "bg-amber-500/10 text-amber-600",
  urgente: "bg-red-500/10 text-red-600",
};

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(221, 83%, 53%)'];

export default function GestaoTarefasPage() {
  const { 
    tarefas, 
    loading, 
    error, 
    criarTarefa, 
    iniciarTarefa, 
    concluirTarefa 
  } = useTarefas();

  const [tab, setTab] = useState("tarefas");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [showNovaTarefa, setShowNovaTarefa] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form nova tarefa
  const [novaTarefa, setNovaTarefa] = useState({
    tipo: "separacao" as TipoTarefa,
    descricao: "",
    prioridade: "media" as PrioridadeTarefa,
    quantidade: 0,
  });

  // Estatísticas
  const stats = useMemo(() => ({
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.status === "pendente").length,
    emAndamento: tarefas.filter(t => t.status === "em_andamento").length,
    concluidas: tarefas.filter(t => t.status === "concluida").length,
  }), [tarefas]);

  // Tarefas filtradas
  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter(t => {
      const matchSearch = 
        searchTerm === "" ||
        t.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filtroStatus === "todos" || t.status === filtroStatus;
      const matchTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
      
      return matchSearch && matchStatus && matchTipo;
    });
  }, [tarefas, searchTerm, filtroStatus, filtroTipo]);

  // Dados para gráfico por status
  const dadosStatus = useMemo(() => {
    return Object.entries(statusLabels).map(([status, label], i) => ({
      name: label,
      value: tarefas.filter(t => t.status === status).length,
      color: COLORS[i % COLORS.length],
    })).filter(d => d.value > 0);
  }, [tarefas]);

  // Dados para gráfico por tipo
  const dadosTipo = useMemo(() => {
    return Object.entries(tipoLabels).map(([tipo, label]) => ({
      tipo: label,
      quantidade: tarefas.filter(t => t.tipo === tipo).length,
    })).filter(d => d.quantidade > 0);
  }, [tarefas]);

  const handleCriarTarefa = async () => {
    if (!novaTarefa.descricao) {
      toast.error("Descrição é obrigatória");
      return;
    }

    setSubmitting(true);
    const tarefa = await criarTarefa({
      tipo: novaTarefa.tipo,
      descricao: novaTarefa.descricao,
      prioridade: novaTarefa.prioridade,
      quantidade: novaTarefa.quantidade || 1,
    });
    setSubmitting(false);

    if (tarefa) {
      setShowNovaTarefa(false);
      setNovaTarefa({
        tipo: "separacao",
        descricao: "",
        prioridade: "media",
        quantidade: 0,
      });
      toast.success("Tarefa criada com sucesso");
    }
  };

  const handleIniciar = async (id: string) => {
    const success = await iniciarTarefa(id);
    if (success) toast.success("Tarefa iniciada");
  };

  const handleConcluir = async (id: string) => {
    const success = await concluirTarefa(id);
    if (success) toast.success("Tarefa concluída");
  };

  if (loading) {
    return (
      <AppLayout title="Gestão de Tarefas" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gestão de Tarefas" showBack>
      <div className="p-4 space-y-6 lg:pl-72">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Gestão de Tarefas</h2>
            <p className="text-sm text-muted-foreground">Organize e acompanhe as atividades do armazém</p>
          </div>
          <Button onClick={() => setShowNovaTarefa(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500/10">
                  <Clock className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold">{stats.emAndamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold">{stats.concluidas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          {/* Tarefas Tab */}
          <TabsContent value="tarefas" className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[150px]">
                  <Package className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(tipoLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Tarefas */}
            <div className="space-y-3">
              {tarefasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tarefa encontrada</p>
                </div>
              ) : (
                tarefasFiltradas.map((tarefa) => (
                  <Card key={tarefa.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={statusColors[tarefa.status]}>
                              {statusLabels[tarefa.status]}
                            </Badge>
                            <Badge variant="outline">{tipoLabels[tarefa.tipo]}</Badge>
                            <Badge variant="outline" className={prioridadeColors[tarefa.prioridade]}>
                              {prioridadeLabels[tarefa.prioridade]}
                            </Badge>
                          </div>
                          <p className="font-medium">{tarefa.descricao || "Tarefa sem descrição"}</p>
                          
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            {tarefa.quantidade && (
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {tarefa.quantidade} un
                              </span>
                            )}
                            {tarefa.posicao_destino && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {tarefa.posicao_destino}
                              </span>
                            )}
                            {tarefa.created_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(tarefa.created_at), "dd/MM HH:mm", { locale: ptBR })}
                              </span>
                            )}
                          </div>

                          {/* Progress */}
                          {tarefa.quantidade_executada !== null && tarefa.quantidade && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{tarefa.quantidade_executada} / {tarefa.quantidade}</span>
                                <span>{((tarefa.quantidade_executada / tarefa.quantidade) * 100).toFixed(0)}%</span>
                              </div>
                              <Progress value={(tarefa.quantidade_executada / tarefa.quantidade) * 100} className="h-2" />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {tarefa.status === "pendente" && (
                            <Button size="sm" onClick={() => handleIniciar(tarefa.id)}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {tarefa.status === "em_andamento" && (
                            <Button size="sm" variant="outline" onClick={() => handleConcluir(tarefa.id)}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Por Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {dadosStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosTipo} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="tipo" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Nova Tarefa */}
      <Dialog open={showNovaTarefa} onOpenChange={setShowNovaTarefa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={novaTarefa.tipo} onValueChange={(v) => setNovaTarefa({ ...novaTarefa, tipo: v as TipoTarefa })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                placeholder="Descreva a tarefa..."
                value={novaTarefa.descricao}
                onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={novaTarefa.prioridade} onValueChange={(v) => setNovaTarefa({ ...novaTarefa, prioridade: v as PrioridadeTarefa })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(prioridadeLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={novaTarefa.quantidade}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, quantidade: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaTarefa(false)}>Cancelar</Button>
            <Button onClick={handleCriarTarefa} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Criar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

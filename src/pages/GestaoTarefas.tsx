import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Users, 
  Package, 
  MapPin,
  Layers,
  TrendingUp,
  AlertCircle,
  UserCheck,
  BarChart3,
  Target,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type StatusOnda = "pendente" | "em_andamento" | "concluida" | "cancelada";
type StatusTarefa = "pendente" | "atribuida" | "em_andamento" | "concluida" | "bloqueada";
type TipoTarefa = "separacao" | "armazenagem" | "transferencia" | "inventario" | "expedicao";
type PrioridadeTarefa = "baixa" | "media" | "alta" | "urgente";

interface Onda {
  id: string;
  codigo: string;
  descricao: string | null;
  zona_alvo: string | null;
  rota: string | null;
  status: StatusOnda;
  prioridade: PrioridadeTarefa;
  data_criacao: string;
  data_inicio: string | null;
  data_conclusao: string | null;
  total_tarefas: number | null;
  tarefas_concluidas: number | null;
  responsavel_id: string | null;
}

interface Tarefa {
  id: string;
  onda_id: string | null;
  tipo: TipoTarefa;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  produto_id: string | null;
  posicao_origem_id: string | null;
  posicao_destino_id: string | null;
  quantidade: number;
  quantidade_executada: number | null;
  operador_id: string | null;
  zona: string | null;
  rota: string | null;
  instrucoes: string | null;
  observacoes: string | null;
  data_atribuicao: string | null;
  data_inicio: string | null;
  data_conclusao: string | null;
  tempo_estimado_minutos: number | null;
  tempo_real_minutos: number | null;
}

const COLORS = {
  pendente: "hsl(var(--muted-foreground))",
  atribuida: "hsl(45, 93%, 47%)",
  em_andamento: "hsl(210, 100%, 50%)",
  concluida: "hsl(142, 76%, 36%)",
  bloqueada: "hsl(0, 84%, 60%)",
  cancelada: "hsl(0, 84%, 60%)",
};

const PRIORITY_COLORS = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-blue-500/20 text-blue-400",
  alta: "bg-amber-500/20 text-amber-400",
  urgente: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS = {
  pendente: "Pendente",
  atribuida: "Atribuída",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  bloqueada: "Bloqueada",
  cancelada: "Cancelada",
};

const TYPE_LABELS = {
  separacao: "Separação",
  armazenagem: "Armazenagem",
  transferencia: "Transferência",
  inventario: "Inventário",
  expedicao: "Expedição",
};

export default function GestaoTarefas() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isNewWaveOpen, setIsNewWaveOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedWave, setSelectedWave] = useState<Onda | null>(null);

  // Form states
  const [newWave, setNewWave] = useState({
    codigo: "",
    descricao: "",
    zona_alvo: "",
    rota: "",
    prioridade: "media" as PrioridadeTarefa,
  });

  const [newTask, setNewTask] = useState({
    tipo: "separacao" as TipoTarefa,
    prioridade: "media" as PrioridadeTarefa,
    zona: "",
    rota: "",
    quantidade: 1,
    instrucoes: "",
    tempo_estimado_minutos: 15,
  });

  // Queries
  const { data: ondas = [], isLoading: loadingOndas } = useQuery({
    queryKey: ["ondas_separacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ondas_separacao")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Onda[];
    },
  });

  const { data: tarefas = [], isLoading: loadingTarefas } = useQuery({
    queryKey: ["tarefas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tarefa[];
    },
  });

  const { data: operadores = [] } = useQuery({
    queryKey: ["operadores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, email");
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const createWaveMutation = useMutation({
    mutationFn: async (wave: typeof newWave) => {
      const { data, error } = await supabase
        .from("ondas_separacao")
        .insert([wave])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ondas_separacao"] });
      toast.success("Onda criada com sucesso!");
      setIsNewWaveOpen(false);
      setNewWave({ codigo: "", descricao: "", zona_alvo: "", rota: "", prioridade: "media" });
    },
    onError: () => toast.error("Erro ao criar onda"),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: typeof newTask & { onda_id?: string }) => {
      const { data, error } = await supabase
        .from("tarefas")
        .insert([task])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["ondas_separacao"] });
      toast.success("Tarefa criada com sucesso!");
      setIsNewTaskOpen(false);
      setNewTask({ tipo: "separacao", prioridade: "media", zona: "", rota: "", quantidade: 1, instrucoes: "", tempo_estimado_minutos: 15 });
    },
    onError: () => toast.error("Erro ao criar tarefa"),
  });

  const updateWaveStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusOnda }) => {
      const updates: Partial<Onda> = { status };
      if (status === "em_andamento") updates.data_inicio = new Date().toISOString();
      if (status === "concluida") updates.data_conclusao = new Date().toISOString();
      
      const { error } = await supabase
        .from("ondas_separacao")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ondas_separacao"] });
      toast.success("Status atualizado!");
    },
  });

  const assignTaskMutation = useMutation({
    mutationFn: async ({ taskId, operadorId }: { taskId: string; operadorId: string }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ 
          operador_id: operadorId, 
          status: "atribuida" as StatusTarefa,
          data_atribuicao: new Date().toISOString() 
        })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success("Tarefa atribuída!");
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusTarefa }) => {
      const updates: Partial<Tarefa> = { status };
      if (status === "em_andamento") updates.data_inicio = new Date().toISOString();
      if (status === "concluida") updates.data_conclusao = new Date().toISOString();
      
      const { error } = await supabase
        .from("tarefas")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success("Tarefa atualizada!");
    },
  });

  // Filters
  const filteredOndas = ondas.filter(onda => {
    const matchesSearch = onda.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onda.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || onda.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTarefas = tarefas.filter(tarefa => {
    const matchesStatus = statusFilter === "all" || tarefa.status === statusFilter;
    return matchesStatus;
  });

  // KPIs
  const totalOndas = ondas.length;
  const ondasEmAndamento = ondas.filter(o => o.status === "em_andamento").length;
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter(t => t.status === "concluida").length;
  const tarefasPendentes = tarefas.filter(t => t.status === "pendente").length;
  const taxaConclusao = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

  // Charts data
  const statusDistribution = [
    { name: "Pendentes", value: tarefas.filter(t => t.status === "pendente").length, color: COLORS.pendente },
    { name: "Atribuídas", value: tarefas.filter(t => t.status === "atribuida").length, color: COLORS.atribuida },
    { name: "Em Andamento", value: tarefas.filter(t => t.status === "em_andamento").length, color: COLORS.em_andamento },
    { name: "Concluídas", value: tarefas.filter(t => t.status === "concluida").length, color: COLORS.concluida },
    { name: "Bloqueadas", value: tarefas.filter(t => t.status === "bloqueada").length, color: COLORS.bloqueada },
  ].filter(item => item.value > 0);

  const tasksByType = [
    { tipo: "Separação", quantidade: tarefas.filter(t => t.tipo === "separacao").length },
    { tipo: "Armazenagem", quantidade: tarefas.filter(t => t.tipo === "armazenagem").length },
    { tipo: "Transferência", quantidade: tarefas.filter(t => t.tipo === "transferencia").length },
    { tipo: "Inventário", quantidade: tarefas.filter(t => t.tipo === "inventario").length },
    { tipo: "Expedição", quantidade: tarefas.filter(t => t.tipo === "expedicao").length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Tarefas</h1>
          <p className="text-muted-foreground">Ondas de separação e atribuição de tarefas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewWaveOpen} onOpenChange={setIsNewWaveOpen}>
            <DialogTrigger asChild>
              <Button>
                <Layers className="mr-2 h-4 w-4" />
                Nova Onda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Onda de Separação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Código</Label>
                  <Input
                    value={newWave.codigo}
                    onChange={(e) => setNewWave({ ...newWave, codigo: e.target.value })}
                    placeholder="ONDA-001"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newWave.descricao}
                    onChange={(e) => setNewWave({ ...newWave, descricao: e.target.value })}
                    placeholder="Descrição da onda..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Zona Alvo</Label>
                    <Input
                      value={newWave.zona_alvo}
                      onChange={(e) => setNewWave({ ...newWave, zona_alvo: e.target.value })}
                      placeholder="A, B, C..."
                    />
                  </div>
                  <div>
                    <Label>Rota</Label>
                    <Input
                      value={newWave.rota}
                      onChange={(e) => setNewWave({ ...newWave, rota: e.target.value })}
                      placeholder="R01, R02..."
                    />
                  </div>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={newWave.prioridade}
                    onValueChange={(v: PrioridadeTarefa) => setNewWave({ ...newWave, prioridade: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewWaveOpen(false)}>Cancelar</Button>
                <Button onClick={() => createWaveMutation.mutate(newWave)} disabled={!newWave.codigo}>
                  Criar Onda
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={newTask.tipo}
                      onValueChange={(v: TipoTarefa) => setNewTask({ ...newTask, tipo: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="separacao">Separação</SelectItem>
                        <SelectItem value="armazenagem">Armazenagem</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="inventario">Inventário</SelectItem>
                        <SelectItem value="expedicao">Expedição</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Select
                      value={newTask.prioridade}
                      onValueChange={(v: PrioridadeTarefa) => setNewTask({ ...newTask, prioridade: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Zona</Label>
                    <Input
                      value={newTask.zona}
                      onChange={(e) => setNewTask({ ...newTask, zona: e.target.value })}
                      placeholder="A, B, C..."
                    />
                  </div>
                  <div>
                    <Label>Rota</Label>
                    <Input
                      value={newTask.rota}
                      onChange={(e) => setNewTask({ ...newTask, rota: e.target.value })}
                      placeholder="R01, R02..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={newTask.quantidade}
                      onChange={(e) => setNewTask({ ...newTask, quantidade: parseInt(e.target.value) || 1 })}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label>Tempo Estimado (min)</Label>
                    <Input
                      type="number"
                      value={newTask.tempo_estimado_minutos}
                      onChange={(e) => setNewTask({ ...newTask, tempo_estimado_minutos: parseInt(e.target.value) || 15 })}
                      min={1}
                    />
                  </div>
                </div>
                <div>
                  <Label>Instruções</Label>
                  <Textarea
                    value={newTask.instrucoes}
                    onChange={(e) => setNewTask({ ...newTask, instrucoes: e.target.value })}
                    placeholder="Instruções para execução..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>Cancelar</Button>
                <Button onClick={() => createTaskMutation.mutate(newTask)}>
                  Criar Tarefa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ondas Ativas</p>
                <p className="text-2xl font-bold">{ondasEmAndamento}</p>
                <p className="text-xs text-muted-foreground">de {totalOndas} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/20 p-3">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
                <p className="text-2xl font-bold">{tarefasPendentes}</p>
                <p className="text-xs text-muted-foreground">aguardando atribuição</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/20 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas Hoje</p>
                <p className="text-2xl font-bold">{tarefasConcluidas}</p>
                <p className="text-xs text-muted-foreground">de {totalTarefas} tarefas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{taxaConclusao}%</p>
                <Progress value={taxaConclusao} className="mt-2 h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="ondas" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="ondas">Ondas</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="operadores">Operadores</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ondas Tab */}
        <TabsContent value="ondas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingOndas ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filteredOndas.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma onda encontrada</p>
                  <Button className="mt-4" onClick={() => setIsNewWaveOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Onda
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredOndas.map((onda) => {
                const progress = onda.total_tarefas ? Math.round(((onda.tarefas_concluidas || 0) / onda.total_tarefas) * 100) : 0;
                return (
                  <Card key={onda.id} className="relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-1 transition-all"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: COLORS[onda.status]
                      }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{onda.codigo}</CardTitle>
                          <p className="text-sm text-muted-foreground">{onda.descricao || "Sem descrição"}</p>
                        </div>
                        <Badge className={PRIORITY_COLORS[onda.prioridade]}>
                          {onda.prioridade}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        {onda.zona_alvo && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>Zona {onda.zona_alvo}</span>
                          </div>
                        )}
                        {onda.rota && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>Rota {onda.rota}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span>{onda.tarefas_concluidas || 0}/{onda.total_tarefas || 0} tarefas</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline"
                          style={{ borderColor: COLORS[onda.status], color: COLORS[onda.status] }}
                        >
                          {STATUS_LABELS[onda.status]}
                        </Badge>
                        <div className="flex gap-1">
                          {onda.status === "pendente" && (
                            <Button
                              size="sm"
                              onClick={() => updateWaveStatusMutation.mutate({ id: onda.id, status: "em_andamento" })}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {onda.status === "em_andamento" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateWaveStatusMutation.mutate({ id: onda.id, status: "pendente" })}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateWaveStatusMutation.mutate({ id: onda.id, status: "concluida" })}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Tarefas Tab */}
        <TabsContent value="tarefas">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Zona/Rota</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTarefas ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredTarefas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTarefas.map((tarefa) => (
                      <TableRow key={tarefa.id}>
                        <TableCell>
                          <Badge variant="outline">{TYPE_LABELS[tarefa.tipo]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            style={{ borderColor: COLORS[tarefa.status], color: COLORS[tarefa.status] }}
                          >
                            {STATUS_LABELS[tarefa.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={PRIORITY_COLORS[tarefa.prioridade]}>
                            {tarefa.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tarefa.zona && <span>Zona {tarefa.zona}</span>}
                          {tarefa.zona && tarefa.rota && " / "}
                          {tarefa.rota && <span>Rota {tarefa.rota}</span>}
                          {!tarefa.zona && !tarefa.rota && "-"}
                        </TableCell>
                        <TableCell>
                          {tarefa.quantidade_executada || 0}/{tarefa.quantidade}
                        </TableCell>
                        <TableCell>
                          {tarefa.operador_id ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Atribuído</span>
                            </div>
                          ) : (
                            <Select
                              onValueChange={(operadorId) => assignTaskMutation.mutate({ taskId: tarefa.id, operadorId })}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Atribuir..." />
                              </SelectTrigger>
                              <SelectContent>
                                {operadores.map((op) => (
                                  <SelectItem key={op.id} value={op.id}>
                                    {op.nome || op.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {tarefa.status === "atribuida" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTaskStatusMutation.mutate({ id: tarefa.id, status: "em_andamento" })}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {tarefa.status === "em_andamento" && (
                              <Button
                                size="sm"
                                onClick={() => updateTaskStatusMutation.mutate({ id: tarefa.id, status: "concluida" })}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operadores Tab */}
        <TabsContent value="operadores">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {operadores.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum operador cadastrado</p>
                </CardContent>
              </Card>
            ) : (
              operadores.map((operador) => {
                const tarefasOperador = tarefas.filter(t => t.operador_id === operador.id);
                const concluidas = tarefasOperador.filter(t => t.status === "concluida").length;
                const emAndamento = tarefasOperador.filter(t => t.status === "em_andamento").length;
                
                return (
                  <Card key={operador.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{operador.nome || "Sem nome"}</CardTitle>
                          <p className="text-sm text-muted-foreground">{operador.email}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-muted-foreground">{tarefasOperador.length}</p>
                          <p className="text-xs text-muted-foreground">Atribuídas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-500">{emAndamento}</p>
                          <p className="text-xs text-muted-foreground">Em Andamento</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-500">{concluidas}</p>
                          <p className="text-xs text-muted-foreground">Concluídas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tarefas por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tasksByType}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="tipo" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

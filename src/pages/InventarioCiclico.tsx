import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useInventarioCiclico, Ciclo, TipoCiclo } from "@/hooks/useInventarioCiclico";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Plus,
  Calendar as CalendarIcon,
  Play,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Settings2,
  Search,
  Filter,
  Warehouse,
  Package,
  XCircle,
  Loader2,
  Pause
} from "lucide-react";
import { format, isToday, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const statusConfig = {
  agendado: { label: "Agendado", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <CalendarIcon className="h-4 w-4" /> },
  em_andamento: { label: "Em Andamento", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <Play className="h-4 w-4" /> },
  pausado: { label: "Pausado", color: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: <Pause className="h-4 w-4" /> },
  concluido: { label: "Concluído", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle className="h-4 w-4" /> },
  cancelado: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="h-4 w-4" /> },
};

const tipoLabels: Record<TipoCiclo, string> = {
  completo: "Completo",
  amostragem: "Amostragem",
  curva_a: "Curva A",
  curva_b: "Curva B",
  curva_c: "Curva C",
  posicao: "Por Posição",
  zona: "Por Zona",
};

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function InventarioCiclicoPage() {
  const navigate = useNavigate();
  const { 
    ciclos, 
    loading, 
    error, 
    criarCiclo, 
    iniciarCiclo, 
    pausarCiclo, 
    finalizarCiclo 
  } = useInventarioCiclico();

  const [tab, setTab] = useState("ciclos");
  const [showNewCicloDialog, setShowNewCicloDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for new cycle
  const [newCiclo, setNewCiclo] = useState({
    nome: "",
    descricao: "",
    tipo: "completo" as TipoCiclo,
    zona_alvo: "",
    data_agendada: new Date(),
  });

  // Filtered cycles
  const ciclosFiltrados = useMemo(() => {
    return ciclos.filter(ciclo => {
      const matchSearch = 
        ciclo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ciclo.descricao?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = statusFilter === "todos" || ciclo.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [ciclos, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const agendados = ciclos.filter(c => c.status === "agendado").length;
    const emAndamento = ciclos.filter(c => c.status === "em_andamento").length;
    const concluidos = ciclos.filter(c => c.status === "concluido").length;
    const acuracidadeMedia = ciclos
      .filter(c => c.acuracidade !== null)
      .reduce((acc, c) => acc + (c.acuracidade || 0), 0) / Math.max(1, ciclos.filter(c => c.acuracidade !== null).length);

    return { agendados, emAndamento, concluidos, acuracidadeMedia };
  }, [ciclos]);

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    return [
      { name: "Agendados", value: stats.agendados, color: COLORS[0] },
      { name: "Em Andamento", value: stats.emAndamento, color: COLORS[1] },
      { name: "Concluídos", value: stats.concluidos, color: COLORS[2] },
    ].filter(d => d.value > 0);
  }, [stats]);

  const dadosAcuracidade = useMemo(() => {
    return ciclos
      .filter(c => c.status === "concluido" && c.acuracidade !== null)
      .slice(0, 5)
      .map(c => ({
        nome: c.nome.substring(0, 15) + "...",
        acuracidade: c.acuracidade || 0,
      }));
  }, [ciclos]);

  const handleCriarCiclo = async () => {
    if (!newCiclo.nome) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const ciclo = await criarCiclo({
      nome: newCiclo.nome,
      descricao: newCiclo.descricao || undefined,
      tipo: newCiclo.tipo,
      zona_alvo: newCiclo.zona_alvo || undefined,
      data_agendada: newCiclo.data_agendada.toISOString(),
    });
    setSubmitting(false);

    if (ciclo) {
      setShowNewCicloDialog(false);
      setNewCiclo({
        nome: "",
        descricao: "",
        tipo: "completo",
        zona_alvo: "",
        data_agendada: new Date(),
      });
      toast({ title: "Sucesso", description: "Ciclo de inventário criado" });
    }
  };

  const handleIniciarCiclo = async (id: string) => {
    const success = await iniciarCiclo(id);
    if (success) {
      toast({ title: "Inventário Iniciado", description: "O ciclo de inventário foi iniciado" });
    }
  };

  const handlePausarCiclo = async (id: string) => {
    const success = await pausarCiclo(id);
    if (success) {
      toast({ title: "Inventário Pausado", description: "O ciclo foi pausado" });
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-blue-500";
  };

  if (loading) {
    return (
      <AppLayout title="Inventário Cíclico" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Inventário Cíclico" showBack>
      <PageTransition>
        <div className="p-4 space-y-6 lg:pl-72">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Controle de Inventário</h2>
              <p className="text-sm text-muted-foreground">Gerencie ciclos de contagem</p>
            </div>
            <Button onClick={() => setShowNewCicloDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Ciclo
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Agendados</p>
                    <p className="text-2xl font-bold">{stats.agendados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Play className="h-5 w-5 text-amber-500" />
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
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold">{stats.concluidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Acuracidade</p>
                    <p className="text-2xl font-bold">{stats.acuracidadeMedia.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ciclos">Ciclos</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>

            {/* Ciclos Tab */}
            <TabsContent value="ciclos" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ciclos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="agendado">Agendados</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluídos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cycles List */}
              <div className="space-y-3">
                {ciclosFiltrados.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum ciclo encontrado</p>
                  </div>
                ) : (
                  ciclosFiltrados.map((ciclo) => {
                    const progress = ciclo.total_posicoes > 0 
                      ? (ciclo.posicoes_contadas / ciclo.total_posicoes) * 100 
                      : 0;
                    const status = statusConfig[ciclo.status as keyof typeof statusConfig] || statusConfig.agendado;

                    return (
                      <Card key={ciclo.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{ciclo.nome}</h3>
                                <Badge variant="outline" className={status.color}>
                                  {status.icon}
                                  <span className="ml-1">{status.label}</span>
                                </Badge>
                              </div>
                              
                              {ciclo.descricao && (
                                <p className="text-sm text-muted-foreground mb-2">{ciclo.descricao}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(new Date(ciclo.data_agendada), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                                <span>•</span>
                                <span>{tipoLabels[ciclo.tipo as TipoCiclo] || ciclo.tipo}</span>
                                {ciclo.zona_alvo && (
                                  <>
                                    <span>•</span>
                                    <span>Zona {ciclo.zona_alvo}</span>
                                  </>
                                )}
                              </div>

                              {/* Progress */}
                              {ciclo.status !== "agendado" && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>{ciclo.posicoes_contadas} / {ciclo.total_posicoes} posições</span>
                                    <span>{progress.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>
                              )}

                              {/* Acuracidade */}
                              {ciclo.acuracidade !== null && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Acuracidade:</span>
                                  <Badge variant="outline" className={
                                    ciclo.acuracidade >= 98 ? "bg-green-500/10 text-green-600" :
                                    ciclo.acuracidade >= 95 ? "bg-amber-500/10 text-amber-600" :
                                    "bg-red-500/10 text-red-600"
                                  }>
                                    {ciclo.acuracidade.toFixed(1)}%
                                  </Badge>
                                  {ciclo.divergencias_encontradas > 0 && (
                                    <span className="text-xs text-red-500">
                                      ({ciclo.divergencias_encontradas} divergências)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              {ciclo.status === "agendado" && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleIniciarCiclo(ciclo.id)}
                                  className="gap-1"
                                >
                                  <Play className="h-4 w-4" />
                                  Iniciar
                                </Button>
                              )}
                              {ciclo.status === "em_andamento" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => navigate(`/inventario/${ciclo.id}`)}
                                  >
                                    Continuar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handlePausarCiclo(ciclo.id)}
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {ciclo.status === "concluido" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigate(`/inventario/${ciclo.id}`)}
                                >
                                  Ver Detalhes
                                </Button>
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

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Status Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribuição por Status</CardTitle>
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
                            {dadosStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Acuracidade Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Acuracidade por Ciclo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      {dadosAcuracidade.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dadosAcuracidade} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="nome" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="acuracidade" fill="hsl(var(--primary))" radius={4} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          Nenhum ciclo concluído ainda
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Configurações do Inventário
                  </CardTitle>
                  <CardDescription>
                    Defina metas e frequências de contagem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Meta de Acuracidade (%)</Label>
                      <Input type="number" defaultValue={99} min={90} max={100} />
                    </div>
                    <div className="space-y-2">
                      <Label>Threshold de Divergência (%)</Label>
                      <Input type="number" defaultValue={5} min={1} max={20} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Frequência Curva A (dias)</Label>
                      <Input type="number" defaultValue={7} min={1} />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequência Curva B (dias)</Label>
                      <Input type="number" defaultValue={14} min={1} />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequência Curva C (dias)</Label>
                      <Input type="number" defaultValue={30} min={1} />
                    </div>
                  </div>

                  <Button className="mt-4">
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* New Cycle Dialog */}
        <Dialog open={showNewCicloDialog} onOpenChange={setShowNewCicloDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Ciclo de Inventário</DialogTitle>
              <DialogDescription>
                Crie um novo ciclo de contagem
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Ciclo *</Label>
                <Input
                  placeholder="Ex: Inventário Zona A - Semana 51"
                  value={newCiclo.nome}
                  onChange={(e) => setNewCiclo({ ...newCiclo, nome: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descrição opcional"
                  value={newCiclo.descricao}
                  onChange={(e) => setNewCiclo({ ...newCiclo, descricao: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={newCiclo.tipo} 
                    onValueChange={(v) => setNewCiclo({ ...newCiclo, tipo: v as TipoCiclo })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Zona Alvo</Label>
                  <Input
                    placeholder="Ex: A, B, C"
                    value={newCiclo.zona_alvo}
                    onChange={(e) => setNewCiclo({ ...newCiclo, zona_alvo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Agendada</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(newCiclo.data_agendada, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newCiclo.data_agendada}
                      onSelect={(date) => date && setNewCiclo({ ...newCiclo, data_agendada: date })}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewCicloDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCriarCiclo} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Ciclo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}

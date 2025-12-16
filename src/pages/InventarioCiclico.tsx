import { useState, useEffect, useMemo } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Plus,
  Calendar as CalendarIcon,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Settings2,
  RefreshCw,
  Search,
  Filter,
  Warehouse,
  Package,
  TrendingUp,
  AlertCircle,
  XCircle
} from "lucide-react";
import { format, addDays, isToday, isPast, isFuture, parseISO } from "date-fns";
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
  LineChart,
  Line,
  Legend
} from "recharts";

// Types
type StatusCiclo = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
type StatusContagem = 'pendente' | 'em_andamento' | 'concluido' | 'divergencia';

interface Ciclo {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  zona_alvo: string | null;
  porta_palete_alvo: string | null;
  data_agendada: string;
  data_inicio: string | null;
  data_fim: string | null;
  status: StatusCiclo;
  total_posicoes: number;
  posicoes_contadas: number;
  divergencias_encontradas: number;
  acuracidade: number | null;
  responsavel_id: string | null;
  observacoes: string | null;
}

interface Config {
  threshold_divergencia: number;
  meta_acuracidade: number;
  frequencia_zona_a: number;
  frequencia_zona_b: number;
  frequencia_zona_c: number;
  alerta_posicao_ociosa_dias: number;
  alerta_vencimento_dias: number;
}

const statusConfig: Record<StatusCiclo, { label: string; color: string; icon: React.ReactNode }> = {
  agendado: { label: "Agendado", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <CalendarIcon className="h-4 w-4" /> },
  em_andamento: { label: "Em Andamento", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <Play className="h-4 w-4" /> },
  concluido: { label: "Concluído", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle className="h-4 w-4" /> },
  cancelado: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="h-4 w-4" /> },
};

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function InventarioCiclicoPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ciclos");
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewCicloDialog, setShowNewCicloDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Form state for new cycle
  const [newCiclo, setNewCiclo] = useState({
    nome: "",
    descricao: "",
    tipo: "zona",
    zona_alvo: "",
    porta_palete_alvo: "",
    data_agendada: new Date(),
  });

  // Fetch data
  useEffect(() => {
    fetchCiclos();
    fetchConfig();
  }, []);

  const fetchCiclos = async () => {
    try {
      const { data, error } = await supabase
        .from('inventario_ciclos')
        .select('*')
        .order('data_agendada', { ascending: false });
      
      if (error) throw error;
      setCiclos(data || []);
    } catch (error) {
      console.error('Error fetching cycles:', error);
      // Use mock data for prototype
      setCiclos(generateMockCiclos());
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('inventario_config')
        .select('*')
        .single();
      
      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      setConfig({
        threshold_divergencia: 5.0,
        meta_acuracidade: 99.0,
        frequencia_zona_a: 7,
        frequencia_zona_b: 14,
        frequencia_zona_c: 30,
        alerta_posicao_ociosa_dias: 30,
        alerta_vencimento_dias: 30,
      });
    }
  };

  // Mock data generator
  const generateMockCiclos = (): Ciclo[] => {
    return [
      {
        id: "1",
        nome: "Inventário Zona A - Semana 50",
        descricao: "Contagem semanal de itens de alta rotatividade",
        tipo: "zona",
        zona_alvo: "A",
        porta_palete_alvo: null,
        data_agendada: format(new Date(), 'yyyy-MM-dd'),
        data_inicio: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        data_fim: null,
        status: "em_andamento",
        total_posicoes: 40,
        posicoes_contadas: 28,
        divergencias_encontradas: 2,
        acuracidade: 95.0,
        responsavel_id: null,
        observacoes: null,
      },
      {
        id: "2",
        nome: "Inventário PP1 Completo",
        descricao: "Contagem completa do porta-palete 1",
        tipo: "corredor",
        zona_alvo: null,
        porta_palete_alvo: "PP1",
        data_agendada: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        data_inicio: null,
        data_fim: null,
        status: "agendado",
        total_posicoes: 40,
        posicoes_contadas: 0,
        divergencias_encontradas: 0,
        acuracidade: null,
        responsavel_id: null,
        observacoes: null,
      },
      {
        id: "3",
        nome: "Inventário Zona B - Quinzenal",
        descricao: "Contagem quinzenal de itens de média rotatividade",
        tipo: "zona",
        zona_alvo: "B",
        porta_palete_alvo: null,
        data_agendada: format(addDays(new Date(), -5), 'yyyy-MM-dd'),
        data_inicio: format(addDays(new Date(), -5), 'yyyy-MM-dd\'T\'08:00:00'),
        data_fim: format(addDays(new Date(), -5), 'yyyy-MM-dd\'T\'14:30:00'),
        status: "concluido",
        total_posicoes: 50,
        posicoes_contadas: 50,
        divergencias_encontradas: 1,
        acuracidade: 98.0,
        responsavel_id: null,
        observacoes: "Concluído dentro do prazo",
      },
      {
        id: "4",
        nome: "Inventário Boxes Expedição",
        descricao: "Contagem dos boxes de expedição",
        tipo: "boxes",
        zona_alvo: null,
        porta_palete_alvo: null,
        data_agendada: format(addDays(new Date(), -10), 'yyyy-MM-dd'),
        data_inicio: format(addDays(new Date(), -10), 'yyyy-MM-dd\'T\'09:00:00'),
        data_fim: format(addDays(new Date(), -10), 'yyyy-MM-dd\'T\'11:00:00'),
        status: "concluido",
        total_posicoes: 16,
        posicoes_contadas: 16,
        divergencias_encontradas: 0,
        acuracidade: 100.0,
        responsavel_id: null,
        observacoes: null,
      },
      {
        id: "5",
        nome: "Inventário Geral - Dezembro",
        descricao: "Inventário completo de fim de ano",
        tipo: "completo",
        zona_alvo: null,
        porta_palete_alvo: null,
        data_agendada: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
        data_inicio: null,
        data_fim: null,
        status: "agendado",
        total_posicoes: 136,
        posicoes_contadas: 0,
        divergencias_encontradas: 0,
        acuracidade: null,
        responsavel_id: null,
        observacoes: "Inventário anual obrigatório",
      },
    ];
  };

  // Filtered cycles
  const filteredCiclos = useMemo(() => {
    return ciclos.filter((ciclo) => {
      const matchesSearch = ciclo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ciclo.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "todos" || ciclo.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ciclos, searchTerm, statusFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const concluidos = ciclos.filter((c) => c.status === "concluido");
    const emAndamento = ciclos.filter((c) => c.status === "em_andamento");
    const agendados = ciclos.filter((c) => c.status === "agendado");
    
    const acuracidadeMedia = concluidos.length > 0
      ? concluidos.reduce((acc, c) => acc + (c.acuracidade || 0), 0) / concluidos.length
      : 0;
    
    const totalDivergencias = ciclos.reduce((acc, c) => acc + c.divergencias_encontradas, 0);
    
    return {
      total: ciclos.length,
      concluidos: concluidos.length,
      emAndamento: emAndamento.length,
      agendados: agendados.length,
      acuracidadeMedia: acuracidadeMedia.toFixed(1),
      totalDivergencias,
      metaAtingida: acuracidadeMedia >= (config?.meta_acuracidade || 99),
    };
  }, [ciclos, config]);

  // Chart data
  const chartDataStatus = useMemo(() => [
    { name: "Concluídos", value: kpis.concluidos },
    { name: "Em Andamento", value: kpis.emAndamento },
    { name: "Agendados", value: kpis.agendados },
  ], [kpis]);

  const chartDataAcuracidade = useMemo(() => {
    return ciclos
      .filter((c) => c.status === "concluido" && c.acuracidade)
      .slice(0, 10)
      .map((c) => ({
        nome: c.nome.substring(0, 15) + "...",
        acuracidade: c.acuracidade,
        meta: config?.meta_acuracidade || 99,
      }));
  }, [ciclos, config]);

  // Create new cycle
  const handleCreateCiclo = async () => {
    if (!newCiclo.nome || !newCiclo.data_agendada) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('inventario_ciclos')
        .insert({
          nome: newCiclo.nome,
          descricao: newCiclo.descricao || null,
          tipo: newCiclo.tipo,
          zona_alvo: newCiclo.zona_alvo || null,
          porta_palete_alvo: newCiclo.porta_palete_alvo || null,
          data_agendada: format(newCiclo.data_agendada, 'yyyy-MM-dd'),
          total_posicoes: newCiclo.tipo === 'completo' ? 136 : 
                          newCiclo.tipo === 'boxes' ? 16 : 40,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCiclos([data, ...ciclos]);
      setShowNewCicloDialog(false);
      setNewCiclo({
        nome: "",
        descricao: "",
        tipo: "zona",
        zona_alvo: "",
        porta_palete_alvo: "",
        data_agendada: new Date(),
      });
      
      toast({ title: "Sucesso", description: "Ciclo de inventário criado com sucesso" });
    } catch (error) {
      console.error('Error creating cycle:', error);
      // Mock create for prototype
      const mockCiclo: Ciclo = {
        id: Date.now().toString(),
        nome: newCiclo.nome,
        descricao: newCiclo.descricao || null,
        tipo: newCiclo.tipo,
        zona_alvo: newCiclo.zona_alvo || null,
        porta_palete_alvo: newCiclo.porta_palete_alvo || null,
        data_agendada: format(newCiclo.data_agendada, 'yyyy-MM-dd'),
        data_inicio: null,
        data_fim: null,
        status: "agendado",
        total_posicoes: newCiclo.tipo === 'completo' ? 136 : newCiclo.tipo === 'boxes' ? 16 : 40,
        posicoes_contadas: 0,
        divergencias_encontradas: 0,
        acuracidade: null,
        responsavel_id: null,
        observacoes: null,
      };
      
      setCiclos([mockCiclo, ...ciclos]);
      setShowNewCicloDialog(false);
      setNewCiclo({
        nome: "",
        descricao: "",
        tipo: "zona",
        zona_alvo: "",
        porta_palete_alvo: "",
        data_agendada: new Date(),
      });
      
      toast({ title: "Sucesso", description: "Ciclo de inventário criado (mock)" });
    }
  };

  // Start cycle
  const handleStartCiclo = async (cicloId: string) => {
    try {
      const { error } = await supabase
        .from('inventario_ciclos')
        .update({ 
          status: 'em_andamento',
          data_inicio: new Date().toISOString(),
        })
        .eq('id', cicloId);

      if (error) throw error;
      
      setCiclos(ciclos.map((c) => 
        c.id === cicloId 
          ? { ...c, status: 'em_andamento' as StatusCiclo, data_inicio: new Date().toISOString() }
          : c
      ));
      
      toast({ title: "Inventário iniciado", description: "O ciclo de inventário foi iniciado" });
    } catch (error) {
      console.error('Error starting cycle:', error);
      setCiclos(ciclos.map((c) => 
        c.id === cicloId 
          ? { ...c, status: 'em_andamento' as StatusCiclo, data_inicio: new Date().toISOString() }
          : c
      ));
      toast({ title: "Inventário iniciado", description: "O ciclo de inventário foi iniciado (mock)" });
    }
  };

  // Save config
  const handleSaveConfig = async () => {
    if (!config) return;
    
    try {
      const { error } = await supabase
        .from('inventario_config')
        .update(config)
        .eq('id', '1'); // Config has single row

      if (error) throw error;
      
      toast({ title: "Configurações salvas", description: "As configurações foram atualizadas" });
      setShowConfigDialog(false);
    } catch (error) {
      console.error('Error saving config:', error);
      toast({ title: "Configurações salvas", description: "As configurações foram atualizadas (mock)" });
      setShowConfigDialog(false);
    }
  };

  const getProgressColor = (acuracidade: number | null, meta: number) => {
    if (!acuracidade) return "bg-muted";
    if (acuracidade >= meta) return "bg-green-500";
    if (acuracidade >= meta - 5) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <AppLayout title="Inventário Cíclico" showBack>
      <PageTransition>
        <div className="p-4 space-y-6 lg:ml-64">
          {/* Header Actions */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={() => setShowNewCicloDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Ciclo
              </Button>
              <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
            <Button variant="outline" onClick={fetchCiclos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Ciclos</p>
                    <p className="text-2xl font-bold">{kpis.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    kpis.metaAtingida ? "bg-green-500/10" : "bg-amber-500/10"
                  )}>
                    <Target className={cn(
                      "h-5 w-5",
                      kpis.metaAtingida ? "text-green-500" : "text-amber-500"
                    )} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Acuracidade Média</p>
                    <p className="text-2xl font-bold">{kpis.acuracidadeMedia}%</p>
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
                    <p className="text-2xl font-bold">{kpis.emAndamento}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Divergências</p>
                    <p className="text-2xl font-bold">{kpis.totalDivergencias}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ciclos">Ciclos</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
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
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="agendado">Agendados</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluídos</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cycles List */}
              <div className="space-y-3">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Carregando...</p>
                    </CardContent>
                  </Card>
                ) : filteredCiclos.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum ciclo encontrado</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredCiclos.map((ciclo) => (
                    <Card key={ciclo.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{ciclo.nome}</h3>
                              <Badge className={statusConfig[ciclo.status].color}>
                                {statusConfig[ciclo.status].icon}
                                <span className="ml-1">{statusConfig[ciclo.status].label}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{ciclo.descricao}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {format(parseISO(ciclo.data_agendada), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Warehouse className="h-3 w-3" />
                                {ciclo.tipo === 'zona' ? `Zona ${ciclo.zona_alvo}` :
                                 ciclo.tipo === 'corredor' ? ciclo.porta_palete_alvo :
                                 ciclo.tipo === 'boxes' ? 'Boxes' : 'Completo'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {ciclo.posicoes_contadas}/{ciclo.total_posicoes} posições
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {ciclo.status === "em_andamento" || ciclo.status === "concluido" ? (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span>Progresso</span>
                                  <span className="font-medium">
                                    {((ciclo.posicoes_contadas / ciclo.total_posicoes) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(ciclo.posicoes_contadas / ciclo.total_posicoes) * 100} 
                                  className="h-2"
                                />
                                {ciclo.acuracidade && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Acuracidade:</span>
                                    <span className={cn(
                                      "font-medium",
                                      ciclo.acuracidade >= (config?.meta_acuracidade || 99) 
                                        ? "text-green-600" 
                                        : "text-amber-600"
                                    )}>
                                      {ciclo.acuracidade}%
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {isToday(parseISO(ciclo.data_agendada)) && "Agendado para hoje"}
                                {isPast(parseISO(ciclo.data_agendada)) && !isToday(parseISO(ciclo.data_agendada)) && (
                                  <span className="text-amber-600">Atrasado</span>
                                )}
                                {isFuture(parseISO(ciclo.data_agendada)) && `Em ${Math.ceil((parseISO(ciclo.data_agendada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias`}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {ciclo.status === "agendado" && (
                              <Button 
                                size="sm" 
                                onClick={() => handleStartCiclo(ciclo.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Iniciar
                              </Button>
                            )}
                            {ciclo.status === "em_andamento" && (
                              <Button 
                                size="sm"
                                onClick={() => navigate(`/inventario/${ciclo.id}`)}
                              >
                                Continuar
                              </Button>
                            )}
                            {ciclo.status === "concluido" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/inventario/${ciclo.id}`)}
                              >
                                Ver Detalhes
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

            {/* Relatórios Tab */}
            <TabsContent value="relatorios" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Status Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Distribuição por Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartDataStatus}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {chartDataStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Accuracy Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Acuracidade por Ciclo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartDataAcuracidade} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis type="number" domain={[90, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="nome" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Bar dataKey="acuracidade" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{kpis.concluidos}</p>
                    <p className="text-xs text-muted-foreground">Concluídos</p>
                  </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">{kpis.emAndamento}</p>
                    <p className="text-xs text-muted-foreground">Em Andamento</p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <CalendarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{kpis.agendados}</p>
                    <p className="text-xs text-muted-foreground">Agendados</p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  kpis.metaAtingida 
                    ? "bg-green-500/5 border-green-500/20" 
                    : "bg-red-500/5 border-red-500/20"
                )}>
                  <CardContent className="p-4 text-center">
                    <Target className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      kpis.metaAtingida ? "text-green-500" : "text-red-500"
                    )} />
                    <p className={cn(
                      "text-2xl font-bold",
                      kpis.metaAtingida ? "text-green-600" : "text-red-600"
                    )}>{config?.meta_acuracidade || 99}%</p>
                    <p className="text-xs text-muted-foreground">Meta</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Agenda Tab */}
            <TabsContent value="agenda" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Inventários Agendados</CardTitle>
                  <CardDescription>
                    Calendário de contagens programadas baseado na frequência por zona
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {config && (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">Zona A</p>
                          <p className="text-sm text-muted-foreground">A cada {config.frequencia_zona_a} dias</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-amber-600">Zona B</p>
                          <p className="text-sm text-muted-foreground">A cada {config.frequencia_zona_b} dias</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">Zona C</p>
                          <p className="text-sm text-muted-foreground">A cada {config.frequencia_zona_c} dias</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {ciclos
                        .filter((c) => c.status === "agendado")
                        .sort((a, b) => new Date(a.data_agendada).getTime() - new Date(b.data_agendada).getTime())
                        .map((ciclo) => (
                          <div 
                            key={ciclo.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                isToday(parseISO(ciclo.data_agendada)) ? "bg-green-500" :
                                isPast(parseISO(ciclo.data_agendada)) ? "bg-red-500" : "bg-blue-500"
                              )} />
                              <div>
                                <p className="font-medium">{ciclo.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(parseISO(ciclo.data_agendada), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStartCiclo(ciclo.id)}
                            >
                              Iniciar
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* New Cycle Dialog */}
        <Dialog open={showNewCicloDialog} onOpenChange={setShowNewCicloDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Ciclo de Inventário</DialogTitle>
              <DialogDescription>
                Agende um novo ciclo de contagem
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Ciclo *</Label>
                <Input
                  value={newCiclo.nome}
                  onChange={(e) => setNewCiclo({ ...newCiclo, nome: e.target.value })}
                  placeholder="Ex: Inventário Zona A - Semana 50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newCiclo.descricao}
                  onChange={(e) => setNewCiclo({ ...newCiclo, descricao: e.target.value })}
                  placeholder="Descrição opcional"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Contagem</Label>
                <Select 
                  value={newCiclo.tipo} 
                  onValueChange={(v) => setNewCiclo({ ...newCiclo, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zona">Por Zona (A, B, C)</SelectItem>
                    <SelectItem value="corredor">Por Corredor (PP1, PP2, PP3)</SelectItem>
                    <SelectItem value="boxes">Boxes de Expedição</SelectItem>
                    <SelectItem value="completo">Inventário Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newCiclo.tipo === "zona" && (
                <div className="space-y-2">
                  <Label>Zona Alvo</Label>
                  <Select 
                    value={newCiclo.zona_alvo} 
                    onValueChange={(v) => setNewCiclo({ ...newCiclo, zona_alvo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a zona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Zona A (Alta rotatividade)</SelectItem>
                      <SelectItem value="B">Zona B (Média rotatividade)</SelectItem>
                      <SelectItem value="C">Zona C (Baixa rotatividade)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {newCiclo.tipo === "corredor" && (
                <div className="space-y-2">
                  <Label>Porta-Palete</Label>
                  <Select 
                    value={newCiclo.porta_palete_alvo} 
                    onValueChange={(v) => setNewCiclo({ ...newCiclo, porta_palete_alvo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o PP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PP1">PP1</SelectItem>
                      <SelectItem value="PP2">PP2</SelectItem>
                      <SelectItem value="PP3">PP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Data Agendada *</Label>
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
              <Button onClick={handleCreateCiclo}>
                Criar Ciclo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Config Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configurações de Inventário</DialogTitle>
              <DialogDescription>
                Configure os parâmetros do sistema
              </DialogDescription>
            </DialogHeader>
            
            {config && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Meta de Acuracidade (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.meta_acuracidade}
                    onChange={(e) => setConfig({ ...config, meta_acuracidade: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Threshold de Divergência (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.threshold_divergencia}
                    onChange={(e) => setConfig({ ...config, threshold_divergencia: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Zona A (dias)</Label>
                    <Input
                      type="number"
                      value={config.frequencia_zona_a}
                      onChange={(e) => setConfig({ ...config, frequencia_zona_a: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Zona B (dias)</Label>
                    <Input
                      type="number"
                      value={config.frequencia_zona_b}
                      onChange={(e) => setConfig({ ...config, frequencia_zona_b: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Zona C (dias)</Label>
                    <Input
                      type="number"
                      value={config.frequencia_zona_c}
                      onChange={(e) => setConfig({ ...config, frequencia_zona_c: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Alerta Posição Ociosa (dias)</Label>
                  <Input
                    type="number"
                    value={config.alerta_posicao_ociosa_dias}
                    onChange={(e) => setConfig({ ...config, alerta_posicao_ociosa_dias: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Alerta Vencimento (dias)</Label>
                  <Input
                    type="number"
                    value={config.alerta_vencimento_dias}
                    onChange={(e) => setConfig({ ...config, alerta_vencimento_dias: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveConfig}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}
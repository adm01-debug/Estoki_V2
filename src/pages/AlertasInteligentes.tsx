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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Bell, 
  BellRing,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  TrendingDown,
  TrendingUp,
  Calendar,
  ShoppingCart,
  BarChart3,
  Zap
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type TipoAlerta = "estoque_minimo" | "estoque_maximo" | "ponto_pedido" | "posicao_ociosa" | "vencimento_proximo" | "gargalo_triagem" | "divergencia_inventario" | "item_sem_movimentacao";
type SeveridadeAlerta = "info" | "aviso" | "critico" | "urgente";
type StatusAlerta = "ativo" | "reconhecido" | "resolvido" | "ignorado";

interface AlertaConfig {
  id: string;
  tipo: TipoAlerta;
  ativo: boolean;
  threshold_valor: number | null;
  threshold_dias: number | null;
  severidade: SeveridadeAlerta;
  notificar_email: boolean | null;
  notificar_push: boolean | null;
  descricao: string | null;
}

interface AlertaHistorico {
  id: string;
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  status: StatusAlerta;
  titulo: string;
  mensagem: string;
  dados_contexto: unknown;
  produto_id: string | null;
  posicao_id: string | null;
  lote_id: string | null;
  created_at: string;
}

interface RegraPontoPedido {
  id: string;
  produto_id: string;
  estoque_minimo: number;
  estoque_maximo: number | null;
  ponto_pedido: number;
  lead_time_dias: number | null;
  quantidade_pedido_sugerida: number | null;
  fornecedor_preferencial: string | null;
  ativo: boolean;
}

const SEVERIDADE_CONFIG = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/20", border: "border-blue-500/50" },
  aviso: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/20", border: "border-amber-500/50" },
  critico: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/20", border: "border-orange-500/50" },
  urgente: { icon: BellRing, color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500/50" },
};

const STATUS_CONFIG = {
  ativo: { label: "Ativo", color: "bg-red-500/20 text-red-400 border-red-500/50" },
  reconhecido: { label: "Reconhecido", color: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
  resolvido: { label: "Resolvido", color: "bg-green-500/20 text-green-400 border-green-500/50" },
  ignorado: { label: "Ignorado", color: "bg-muted text-muted-foreground border-muted" },
};

const TIPO_LABELS: Record<TipoAlerta, string> = {
  estoque_minimo: "Estoque Mínimo",
  estoque_maximo: "Estoque Máximo",
  ponto_pedido: "Ponto de Pedido",
  posicao_ociosa: "Posição Ociosa",
  vencimento_proximo: "Vencimento Próximo",
  gargalo_triagem: "Gargalo Triagem",
  divergencia_inventario: "Divergência Inventário",
  item_sem_movimentacao: "Item Sem Movimentação",
};

const TIPO_ICONS: Record<TipoAlerta, typeof Package> = {
  estoque_minimo: TrendingDown,
  estoque_maximo: TrendingUp,
  ponto_pedido: ShoppingCart,
  posicao_ociosa: MapPin,
  vencimento_proximo: Calendar,
  gargalo_triagem: Clock,
  divergencia_inventario: AlertTriangle,
  item_sem_movimentacao: Package,
};

export default function AlertasInteligentes() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ativo");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConfig, setSelectedConfig] = useState<AlertaConfig | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Queries
  const { data: configs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ["alertas_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas_config")
        .select("*")
        .order("tipo");
      if (error) throw error;
      return data as AlertaConfig[];
    },
  });

  const { data: alertas = [], isLoading: loadingAlertas } = useQuery({
    queryKey: ["alertas_historico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas_historico")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AlertaHistorico[];
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, sku, estoque_minimo, ponto_pedido")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: regras = [] } = useQuery({
    queryKey: ["regras_ponto_pedido"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regras_ponto_pedido")
        .select("*");
      if (error) throw error;
      return data as RegraPontoPedido[];
    },
  });

  // Mutations
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<AlertaConfig> & { id: string }) => {
      const { id, ...updates } = config;
      const { error } = await supabase
        .from("alertas_config")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas_config"] });
      toast.success("Configuração atualizada!");
      setIsConfigOpen(false);
    },
    onError: () => toast.error("Erro ao atualizar configuração"),
  });

  const updateAlertaStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusAlerta }) => {
      const updates: { 
        status: StatusAlerta; 
        data_reconhecimento?: string; 
        data_resolucao?: string; 
      } = { status };
      if (status === "reconhecido") {
        updates.data_reconhecimento = new Date().toISOString();
      }
      if (status === "resolvido") {
        updates.data_resolucao = new Date().toISOString();
      }
      const { error } = await supabase
        .from("alertas_historico")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas_historico"] });
      toast.success("Alerta atualizado!");
    },
  });

  const createRegraMutation = useMutation({
    mutationFn: async (regra: Omit<RegraPontoPedido, "id">) => {
      const { data, error } = await supabase
        .from("regras_ponto_pedido")
        .upsert([regra], { onConflict: "produto_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras_ponto_pedido"] });
      toast.success("Regra salva com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar regra"),
  });

  // Filters
  const filteredAlertas = alertas.filter(alerta => {
    const matchesStatus = statusFilter === "all" || alerta.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || alerta.tipo === tipoFilter;
    const matchesSearch = alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerta.mensagem.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesTipo && matchesSearch;
  });

  // KPIs
  const alertasAtivos = alertas.filter(a => a.status === "ativo").length;
  const alertasCriticos = alertas.filter(a => a.status === "ativo" && (a.severidade === "critico" || a.severidade === "urgente")).length;
  const alertasHoje = alertas.filter(a => {
    const today = new Date().toDateString();
    return new Date(a.created_at).toDateString() === today;
  }).length;
  const configsAtivas = configs.filter(c => c.ativo).length;

  // Charts data
  const alertasPorTipo = Object.entries(
    alertas.reduce((acc, alerta) => {
      acc[alerta.tipo] = (acc[alerta.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([tipo, count]) => ({
    name: TIPO_LABELS[tipo as TipoAlerta],
    value: count,
  }));

  const alertasPorSeveridade = [
    { name: "Info", value: alertas.filter(a => a.severidade === "info").length, color: "#3B82F6" },
    { name: "Aviso", value: alertas.filter(a => a.severidade === "aviso").length, color: "#F59E0B" },
    { name: "Crítico", value: alertas.filter(a => a.severidade === "critico").length, color: "#F97316" },
    { name: "Urgente", value: alertas.filter(a => a.severidade === "urgente").length, color: "#EF4444" },
  ].filter(item => item.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas Inteligentes</h1>
          <p className="text-muted-foreground">Monitoramento e notificações automáticas</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={alertasCriticos > 0 ? "border-red-500/50 animate-pulse" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-3 ${alertasCriticos > 0 ? "bg-red-500/20" : "bg-amber-500/20"}`}>
                <BellRing className={`h-6 w-6 ${alertasCriticos > 0 ? "text-red-500" : "text-amber-500"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{alertasAtivos}</p>
                {alertasCriticos > 0 && (
                  <p className="text-xs text-red-500">{alertasCriticos} críticos</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Bell className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Hoje</p>
                <p className="text-2xl font-bold">{alertasHoje}</p>
                <p className="text-xs text-muted-foreground">novos alertas</p>
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
                <p className="text-sm text-muted-foreground">Resolvidos (7d)</p>
                <p className="text-2xl font-bold">
                  {alertas.filter(a => a.status === "resolvido").length}
                </p>
                <p className="text-xs text-muted-foreground">últimos 7 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regras Ativas</p>
                <p className="text-2xl font-bold">{configsAtivas}</p>
                <p className="text-xs text-muted-foreground">de {configs.length} configuradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alertas" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="alertas">
              <Bell className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="configuracao">
              <Settings className="h-4 w-4 mr-2" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="ponto-pedido">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ponto de Pedido
            </TabsTrigger>
            <TabsTrigger value="relatorios">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="reconhecido">Reconhecidos</SelectItem>
                <SelectItem value="resolvido">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alertas Tab */}
        <TabsContent value="alertas" className="space-y-4">
          {loadingAlertas ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Carregando alertas...
              </CardContent>
            </Card>
          ) : filteredAlertas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500/50 mb-4" />
                <p className="text-muted-foreground">Nenhum alerta encontrado</p>
                <p className="text-sm text-muted-foreground">Tudo está funcionando corretamente!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlertas.map((alerta) => {
                const SeveridadeIcon = SEVERIDADE_CONFIG[alerta.severidade].icon;
                const TipoIcon = TIPO_ICONS[alerta.tipo];
                
                return (
                  <Card 
                    key={alerta.id} 
                    className={`transition-all ${
                      alerta.status === "ativo" 
                        ? SEVERIDADE_CONFIG[alerta.severidade].border 
                        : "border-border"
                    }`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-full p-2 ${SEVERIDADE_CONFIG[alerta.severidade].bg}`}>
                          <SeveridadeIcon className={`h-5 w-5 ${SEVERIDADE_CONFIG[alerta.severidade].color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{alerta.titulo}</h3>
                                <Badge variant="outline" className={STATUS_CONFIG[alerta.status].color}>
                                  {STATUS_CONFIG[alerta.status].label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <TipoIcon className="h-3 w-3" />
                                  <span>{TIPO_LABELS[alerta.tipo]}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(new Date(alerta.created_at), { 
                                      addSuffix: true, 
                                      locale: ptBR 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {alerta.status === "ativo" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAlertaStatusMutation.mutate({ 
                                    id: alerta.id, 
                                    status: "reconhecido" 
                                  })}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Reconhecer
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateAlertaStatusMutation.mutate({ 
                                    id: alerta.id, 
                                    status: "resolvido" 
                                  })}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Resolver
                                </Button>
                              </div>
                            )}
                            {alerta.status === "reconhecido" && (
                              <Button
                                size="sm"
                                onClick={() => updateAlertaStatusMutation.mutate({ 
                                  id: alerta.id, 
                                  status: "resolvido" 
                                })}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Resolver
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Configuração Tab */}
        <TabsContent value="configuracao">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Alerta</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Notificações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingConfigs ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : (
                    configs.map((config) => {
                      const TipoIcon = TIPO_ICONS[config.tipo];
                      return (
                        <TableRow key={config.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TipoIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{TIPO_LABELS[config.tipo]}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {config.descricao}
                          </TableCell>
                          <TableCell>
                            <Badge className={SEVERIDADE_CONFIG[config.severidade].bg}>
                              {config.severidade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {config.threshold_valor && <span>{config.threshold_valor}</span>}
                            {config.threshold_dias && <span>{config.threshold_dias} dias</span>}
                            {!config.threshold_valor && !config.threshold_dias && "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {config.notificar_push && <Bell className="h-4 w-4 text-primary" />}
                              {config.notificar_email && <span className="text-xs">Email</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={config.ativo}
                              onCheckedChange={(checked) => 
                                updateConfigMutation.mutate({ id: config.id, ativo: checked })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedConfig(config);
                                setIsConfigOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ponto de Pedido Tab */}
        <TabsContent value="ponto-pedido">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Regras de Ponto de Pedido por Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque Mínimo</TableHead>
                    <TableHead>Ponto de Pedido</TableHead>
                    <TableHead>Estoque Máximo</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Qtd. Sugerida</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum produto cadastrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    produtos.map((produto) => {
                      const regra = regras.find(r => r.produto_id === produto.id);
                      return (
                        <TableRow key={produto.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{produto.nome}</p>
                              <p className="text-xs text-muted-foreground">{produto.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-20 h-8"
                              defaultValue={regra?.estoque_minimo ?? produto.estoque_minimo ?? 0}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                createRegraMutation.mutate({
                                  produto_id: produto.id,
                                  estoque_minimo: value,
                                  estoque_maximo: regra?.estoque_maximo ?? null,
                                  ponto_pedido: regra?.ponto_pedido ?? produto.ponto_pedido ?? 0,
                                  lead_time_dias: regra?.lead_time_dias ?? 7,
                                  quantidade_pedido_sugerida: regra?.quantidade_pedido_sugerida ?? null,
                                  fornecedor_preferencial: regra?.fornecedor_preferencial ?? null,
                                  ativo: true,
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-20 h-8"
                              defaultValue={regra?.ponto_pedido ?? produto.ponto_pedido ?? 0}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                createRegraMutation.mutate({
                                  produto_id: produto.id,
                                  estoque_minimo: regra?.estoque_minimo ?? produto.estoque_minimo ?? 0,
                                  estoque_maximo: regra?.estoque_maximo ?? null,
                                  ponto_pedido: value,
                                  lead_time_dias: regra?.lead_time_dias ?? 7,
                                  quantidade_pedido_sugerida: regra?.quantidade_pedido_sugerida ?? null,
                                  fornecedor_preferencial: regra?.fornecedor_preferencial ?? null,
                                  ativo: true,
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-20 h-8"
                              defaultValue={regra?.estoque_maximo ?? ""}
                              placeholder="-"
                              onBlur={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : null;
                                createRegraMutation.mutate({
                                  produto_id: produto.id,
                                  estoque_minimo: regra?.estoque_minimo ?? produto.estoque_minimo ?? 0,
                                  estoque_maximo: value,
                                  ponto_pedido: regra?.ponto_pedido ?? produto.ponto_pedido ?? 0,
                                  lead_time_dias: regra?.lead_time_dias ?? 7,
                                  quantidade_pedido_sugerida: regra?.quantidade_pedido_sugerida ?? null,
                                  fornecedor_preferencial: regra?.fornecedor_preferencial ?? null,
                                  ativo: true,
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-16 h-8"
                              defaultValue={regra?.lead_time_dias ?? 7}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value) || 7;
                                createRegraMutation.mutate({
                                  produto_id: produto.id,
                                  estoque_minimo: regra?.estoque_minimo ?? produto.estoque_minimo ?? 0,
                                  estoque_maximo: regra?.estoque_maximo ?? null,
                                  ponto_pedido: regra?.ponto_pedido ?? produto.ponto_pedido ?? 0,
                                  lead_time_dias: value,
                                  quantidade_pedido_sugerida: regra?.quantidade_pedido_sugerida ?? null,
                                  fornecedor_preferencial: regra?.fornecedor_preferencial ?? null,
                                  ativo: true,
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-20 h-8"
                              defaultValue={regra?.quantidade_pedido_sugerida ?? ""}
                              placeholder="-"
                              onBlur={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : null;
                                createRegraMutation.mutate({
                                  produto_id: produto.id,
                                  estoque_minimo: regra?.estoque_minimo ?? produto.estoque_minimo ?? 0,
                                  estoque_maximo: regra?.estoque_maximo ?? null,
                                  ponto_pedido: regra?.ponto_pedido ?? produto.ponto_pedido ?? 0,
                                  lead_time_dias: regra?.lead_time_dias ?? 7,
                                  quantidade_pedido_sugerida: value,
                                  fornecedor_preferencial: regra?.fornecedor_preferencial ?? null,
                                  ativo: true,
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={regra?.ativo ? "bg-green-500/20 text-green-400" : ""}>
                              {regra ? "Configurado" : "Padrão"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Alertas por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alertasPorTipo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Distribuição por Severidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertasPorSeveridade}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {alertasPorSeveridade.map((entry, index) => (
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

      {/* Config Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Alerta: {selectedConfig && TIPO_LABELS[selectedConfig.tipo]}</DialogTitle>
          </DialogHeader>
          {selectedConfig && (
            <div className="space-y-4">
              <div>
                <Label>Severidade</Label>
                <Select
                  value={selectedConfig.severidade}
                  onValueChange={(v: SeveridadeAlerta) => 
                    setSelectedConfig({ ...selectedConfig, severidade: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="aviso">Aviso</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(selectedConfig.tipo === "gargalo_triagem" || selectedConfig.tipo === "divergencia_inventario") && (
                <div>
                  <Label>Threshold (valor)</Label>
                  <Input
                    type="number"
                    value={selectedConfig.threshold_valor ?? ""}
                    onChange={(e) => setSelectedConfig({ 
                      ...selectedConfig, 
                      threshold_valor: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    placeholder="Ex: 10"
                  />
                </div>
              )}
              
              {(selectedConfig.tipo === "posicao_ociosa" || selectedConfig.tipo === "vencimento_proximo" || selectedConfig.tipo === "item_sem_movimentacao") && (
                <div>
                  <Label>Threshold (dias)</Label>
                  <Input
                    type="number"
                    value={selectedConfig.threshold_dias ?? ""}
                    onChange={(e) => setSelectedConfig({ 
                      ...selectedConfig, 
                      threshold_dias: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="Ex: 30"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label>Notificação Push</Label>
                <Switch
                  checked={selectedConfig.notificar_push ?? false}
                  onCheckedChange={(checked) => 
                    setSelectedConfig({ ...selectedConfig, notificar_push: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Notificação Email</Label>
                <Switch
                  checked={selectedConfig.notificar_email ?? false}
                  onCheckedChange={(checked) => 
                    setSelectedConfig({ ...selectedConfig, notificar_email: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancelar</Button>
            <Button 
              onClick={() => selectedConfig && updateConfigMutation.mutate(selectedConfig)}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

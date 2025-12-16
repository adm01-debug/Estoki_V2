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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Route as RouteIcon,
  Search,
  Package,
  Truck,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Printer,
  Camera,
  User,
  Phone,
  Calendar,
  ArrowRight,
  History,
  Navigation
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type TipoEvento = "recebimento_nf" | "conferencia" | "triagem_inicio" | "triagem_fim" | "armazenamento" | "reserva" | "separacao" | "conferencia_expedicao" | "carregamento" | "saida_transporte" | "entrega" | "devolucao" | "ajuste_estoque";
type StatusRomaneio = "rascunho" | "confirmado" | "em_transito" | "entregue" | "parcial" | "cancelado";
type StatusEntrega = "pendente" | "em_rota" | "entregue" | "recusado" | "parcial" | "reagendado";

interface RastreamentoHistorico {
  id: string;
  produto_id: string | null;
  lote_id: string | null;
  posicao_id: string | null;
  tipo_evento: TipoEvento;
  descricao: string;
  detalhes: unknown;
  quantidade: number | null;
  documento_referencia: string | null;
  operador_id: string | null;
  data_evento: string;
  localizacao: string | null;
}

interface Romaneio {
  id: string;
  codigo: string;
  data_criacao: string;
  data_prevista_entrega: string | null;
  data_saida: string | null;
  data_retorno: string | null;
  status: StatusRomaneio;
  motorista: string | null;
  placa_veiculo: string | null;
  tipo_veiculo: string | null;
  rota: string | null;
  observacoes: string | null;
  total_volumes: number | null;
  total_peso_kg: number | null;
  total_entregas: number | null;
  entregas_realizadas: number | null;
}

interface RomaneioItem {
  id: string;
  romaneio_id: string;
  produto_id: string | null;
  quantidade: number;
  cliente: string;
  endereco_entrega: string;
  contato_cliente: string | null;
  telefone_cliente: string | null;
  pedido_referencia: string | null;
  nf_saida: string | null;
  ordem_entrega: number | null;
}

interface ComprovanteEntrega {
  id: string;
  romaneio_id: string;
  romaneio_item_id: string | null;
  status: StatusEntrega;
  data_entrega: string | null;
  recebedor_nome: string | null;
  recebedor_documento: string | null;
  observacoes: string | null;
  motivo_recusa: string | null;
}

const EVENTO_CONFIG: Record<TipoEvento, { label: string; icon: typeof Package; color: string }> = {
  recebimento_nf: { label: "Recebimento NF", icon: FileText, color: "text-blue-500" },
  conferencia: { label: "Conferência", icon: CheckCircle2, color: "text-cyan-500" },
  triagem_inicio: { label: "Início Triagem", icon: Search, color: "text-amber-500" },
  triagem_fim: { label: "Fim Triagem", icon: CheckCircle2, color: "text-green-500" },
  armazenamento: { label: "Armazenamento", icon: Package, color: "text-purple-500" },
  reserva: { label: "Reserva", icon: Clock, color: "text-orange-500" },
  separacao: { label: "Separação", icon: Package, color: "text-indigo-500" },
  conferencia_expedicao: { label: "Conf. Expedição", icon: CheckCircle2, color: "text-teal-500" },
  carregamento: { label: "Carregamento", icon: Truck, color: "text-blue-600" },
  saida_transporte: { label: "Saída Transporte", icon: Navigation, color: "text-green-600" },
  entrega: { label: "Entrega", icon: MapPin, color: "text-green-500" },
  devolucao: { label: "Devolução", icon: AlertCircle, color: "text-red-500" },
  ajuste_estoque: { label: "Ajuste Estoque", icon: History, color: "text-gray-500" },
};

const STATUS_ROMANEIO_CONFIG: Record<StatusRomaneio, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  confirmado: { label: "Confirmado", color: "bg-blue-500/20 text-blue-400" },
  em_transito: { label: "Em Trânsito", color: "bg-amber-500/20 text-amber-400" },
  entregue: { label: "Entregue", color: "bg-green-500/20 text-green-400" },
  parcial: { label: "Parcial", color: "bg-orange-500/20 text-orange-400" },
  cancelado: { label: "Cancelado", color: "bg-red-500/20 text-red-400" },
};

const STATUS_ENTREGA_CONFIG: Record<StatusEntrega, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-muted text-muted-foreground" },
  em_rota: { label: "Em Rota", color: "bg-blue-500/20 text-blue-400" },
  entregue: { label: "Entregue", color: "bg-green-500/20 text-green-400" },
  recusado: { label: "Recusado", color: "bg-red-500/20 text-red-400" },
  parcial: { label: "Parcial", color: "bg-orange-500/20 text-orange-400" },
  reagendado: { label: "Reagendado", color: "bg-amber-500/20 text-amber-400" },
};

export default function Rastreabilidade() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduto, setSelectedProduto] = useState<string | null>(null);
  const [isNewRomaneioOpen, setIsNewRomaneioOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [selectedRomaneio, setSelectedRomaneio] = useState<Romaneio | null>(null);
  const [isComprovanteOpen, setIsComprovanteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RomaneioItem | null>(null);

  // Form states
  const [newRomaneio, setNewRomaneio] = useState({
    codigo: "",
    motorista: "",
    placa_veiculo: "",
    rota: "",
    data_prevista_entrega: "",
    observacoes: "",
  });

  const [newItem, setNewItem] = useState({
    cliente: "",
    endereco_entrega: "",
    contato_cliente: "",
    telefone_cliente: "",
    quantidade: 1,
    pedido_referencia: "",
    nf_saida: "",
  });

  const [comprovante, setComprovante] = useState({
    recebedor_nome: "",
    recebedor_documento: "",
    observacoes: "",
    status: "entregue" as StatusEntrega,
    motivo_recusa: "",
  });

  // Queries
  const { data: historico = [], isLoading: loadingHistorico } = useQuery({
    queryKey: ["rastreamento_historico", selectedProduto],
    queryFn: async () => {
      let query = supabase
        .from("rastreamento_historico")
        .select("*")
        .order("data_evento", { ascending: false })
        .limit(100);
      
      if (selectedProduto) {
        query = query.eq("produto_id", selectedProduto);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RastreamentoHistorico[];
    },
  });

  const { data: romaneios = [], isLoading: loadingRomaneios } = useQuery({
    queryKey: ["romaneios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("romaneios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Romaneio[];
    },
  });

  const { data: romaneioItens = [] } = useQuery({
    queryKey: ["romaneio_itens", selectedRomaneio?.id],
    queryFn: async () => {
      if (!selectedRomaneio) return [];
      const { data, error } = await supabase
        .from("romaneio_itens")
        .select("*")
        .eq("romaneio_id", selectedRomaneio.id)
        .order("ordem_entrega");
      if (error) throw error;
      return data as RomaneioItem[];
    },
    enabled: !!selectedRomaneio,
  });

  const { data: comprovantes = [] } = useQuery({
    queryKey: ["comprovantes_entrega", selectedRomaneio?.id],
    queryFn: async () => {
      if (!selectedRomaneio) return [];
      const { data, error } = await supabase
        .from("comprovantes_entrega")
        .select("*")
        .eq("romaneio_id", selectedRomaneio.id);
      if (error) throw error;
      return data as ComprovanteEntrega[];
    },
    enabled: !!selectedRomaneio,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos_rastreamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, sku")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const createRomaneioMutation = useMutation({
    mutationFn: async (romaneio: typeof newRomaneio) => {
      const { data, error } = await supabase
        .from("romaneios")
        .insert([{
          ...romaneio,
          data_prevista_entrega: romaneio.data_prevista_entrega || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      toast.success("Romaneio criado com sucesso!");
      setIsNewRomaneioOpen(false);
      setNewRomaneio({ codigo: "", motorista: "", placa_veiculo: "", rota: "", data_prevista_entrega: "", observacoes: "" });
    },
    onError: () => toast.error("Erro ao criar romaneio"),
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem & { romaneio_id: string }) => {
      const { data, error } = await supabase
        .from("romaneio_itens")
        .insert([item])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneio_itens"] });
      toast.success("Item adicionado!");
      setIsNewItemOpen(false);
      setNewItem({ cliente: "", endereco_entrega: "", contato_cliente: "", telefone_cliente: "", quantidade: 1, pedido_referencia: "", nf_saida: "" });
    },
    onError: () => toast.error("Erro ao adicionar item"),
  });

  const updateRomaneioStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusRomaneio }) => {
      const updates: Partial<Romaneio> = { status };
      if (status === "em_transito") {
        (updates as Record<string, unknown>).data_saida = new Date().toISOString();
      }
      if (status === "entregue") {
        (updates as Record<string, unknown>).data_retorno = new Date().toISOString();
      }
      const { error } = await supabase
        .from("romaneios")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      toast.success("Status atualizado!");
    },
  });

  const registrarEntregaMutation = useMutation({
    mutationFn: async (data: {
      romaneio_id: string;
      romaneio_item_id: string;
      status: StatusEntrega;
      recebedor_nome: string;
      recebedor_documento: string;
      observacoes: string;
      motivo_recusa?: string;
    }) => {
      const { error } = await supabase
        .from("comprovantes_entrega")
        .insert([{
          ...data,
          data_entrega: new Date().toISOString(),
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comprovantes_entrega"] });
      toast.success("Entrega registrada!");
      setIsComprovanteOpen(false);
      setComprovante({ recebedor_nome: "", recebedor_documento: "", observacoes: "", status: "entregue", motivo_recusa: "" });
    },
    onError: () => toast.error("Erro ao registrar entrega"),
  });

  // Filter
  const filteredHistorico = historico.filter(h => 
    h.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.documento_referencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPIs
  const romaneiosEmTransito = romaneios.filter(r => r.status === "em_transito").length;
  const entregasHoje = romaneios.filter(r => {
    const today = new Date().toDateString();
    return r.data_prevista_entrega && new Date(r.data_prevista_entrega).toDateString() === today;
  }).length;
  const totalEventos = historico.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rastreabilidade</h1>
          <p className="text-muted-foreground">Histórico completo e romaneios de entrega</p>
        </div>
        <Dialog open={isNewRomaneioOpen} onOpenChange={setIsNewRomaneioOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Romaneio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Romaneio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Código</Label>
                <Input
                  value={newRomaneio.codigo}
                  onChange={(e) => setNewRomaneio({ ...newRomaneio, codigo: e.target.value })}
                  placeholder="ROM-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Motorista</Label>
                  <Input
                    value={newRomaneio.motorista}
                    onChange={(e) => setNewRomaneio({ ...newRomaneio, motorista: e.target.value })}
                    placeholder="Nome do motorista"
                  />
                </div>
                <div>
                  <Label>Placa</Label>
                  <Input
                    value={newRomaneio.placa_veiculo}
                    onChange={(e) => setNewRomaneio({ ...newRomaneio, placa_veiculo: e.target.value })}
                    placeholder="ABC-1234"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rota</Label>
                  <Input
                    value={newRomaneio.rota}
                    onChange={(e) => setNewRomaneio({ ...newRomaneio, rota: e.target.value })}
                    placeholder="Zona Sul"
                  />
                </div>
                <div>
                  <Label>Data Prevista</Label>
                  <Input
                    type="date"
                    value={newRomaneio.data_prevista_entrega}
                    onChange={(e) => setNewRomaneio({ ...newRomaneio, data_prevista_entrega: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={newRomaneio.observacoes}
                  onChange={(e) => setNewRomaneio({ ...newRomaneio, observacoes: e.target.value })}
                  placeholder="Observações..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewRomaneioOpen(false)}>Cancelar</Button>
              <Button 
                onClick={() => createRomaneioMutation.mutate(newRomaneio)}
                disabled={!newRomaneio.codigo}
              >
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Truck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Trânsito</p>
                <p className="text-2xl font-bold">{romaneiosEmTransito}</p>
                <p className="text-xs text-muted-foreground">romaneios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/20 p-3">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entregas Hoje</p>
                <p className="text-2xl font-bold">{entregasHoje}</p>
                <p className="text-xs text-muted-foreground">previstas</p>
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
                <p className="text-sm text-muted-foreground">Entregues (mês)</p>
                <p className="text-2xl font-bold">
                  {romaneios.filter(r => r.status === "entregue").length}
                </p>
                <p className="text-xs text-muted-foreground">romaneios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos</p>
                <p className="text-2xl font-bold">{totalEventos}</p>
                <p className="text-xs text-muted-foreground">registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="timeline">
              <History className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="romaneios">
              <Truck className="h-4 w-4 mr-2" />
              Romaneios
            </TabsTrigger>
            <TabsTrigger value="comprovantes">
              <FileText className="h-4 w-4 mr-2" />
              Comprovantes
            </TabsTrigger>
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
            <Select value={selectedProduto || "all"} onValueChange={(v) => setSelectedProduto(v === "all" ? null : v)}>
              <SelectTrigger className="w-[180px]">
                <Package className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos produtos</SelectItem>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Rastreamento</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistorico ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : filteredHistorico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum evento registrado</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {filteredHistorico.map((evento, index) => {
                      const config = EVENTO_CONFIG[evento.tipo_evento];
                      const EventoIcon = config.icon;
                      
                      return (
                        <div key={evento.id} className="relative flex gap-4 pl-4">
                          <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-card ${config.color}`}>
                            <EventoIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{config.label}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(evento.data_evento), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {evento.documento_referencia && (
                                <Badge variant="outline">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {evento.documento_referencia}
                                </Badge>
                              )}
                              {evento.quantidade && (
                                <Badge variant="outline">
                                  Qtd: {evento.quantidade}
                                </Badge>
                              )}
                              {evento.localizacao && (
                                <Badge variant="outline">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {evento.localizacao}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Romaneios Tab */}
        <TabsContent value="romaneios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingRomaneios ? (
              <p className="col-span-full text-center py-8 text-muted-foreground">Carregando...</p>
            ) : romaneios.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum romaneio criado</p>
                  <Button className="mt-4" onClick={() => setIsNewRomaneioOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Romaneio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              romaneios.map((romaneio) => (
                <Card key={romaneio.id} className="relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ 
                      backgroundColor: romaneio.status === "entregue" ? "#10B981" : 
                        romaneio.status === "em_transito" ? "#F59E0B" : "#6B7280"
                    }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{romaneio.codigo}</CardTitle>
                        <p className="text-sm text-muted-foreground">{romaneio.rota || "Sem rota definida"}</p>
                      </div>
                      <Badge className={STATUS_ROMANEIO_CONFIG[romaneio.status].color}>
                        {STATUS_ROMANEIO_CONFIG[romaneio.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{romaneio.motorista || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>{romaneio.placa_veiculo || "-"}</span>
                      </div>
                      {romaneio.data_prevista_entrega && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Previsão: {format(new Date(romaneio.data_prevista_entrega), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        {romaneio.entregas_realizadas || 0}/{romaneio.total_entregas || 0} entregas
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedRomaneio(romaneio)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {romaneio.status === "confirmado" && (
                          <Button
                            size="sm"
                            onClick={() => updateRomaneioStatusMutation.mutate({ 
                              id: romaneio.id, 
                              status: "em_transito" 
                            })}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {romaneio.status === "rascunho" && (
                          <Button
                            size="sm"
                            onClick={() => updateRomaneioStatusMutation.mutate({ 
                              id: romaneio.id, 
                              status: "confirmado" 
                            })}
                          >
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Romaneio Detail Dialog */}
          <Dialog open={!!selectedRomaneio} onOpenChange={(open) => !open && setSelectedRomaneio(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {selectedRomaneio?.codigo}
                  <Badge className={STATUS_ROMANEIO_CONFIG[selectedRomaneio?.status || "rascunho"].color}>
                    {STATUS_ROMANEIO_CONFIG[selectedRomaneio?.status || "rascunho"].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Motorista</p>
                    <p className="font-medium">{selectedRomaneio?.motorista || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Veículo</p>
                    <p className="font-medium">{selectedRomaneio?.placa_veiculo || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rota</p>
                    <p className="font-medium">{selectedRomaneio?.rota || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Itens do Romaneio</h4>
                  <Button size="sm" onClick={() => setIsNewItemOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {romaneioItens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          Nenhum item adicionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      romaneioItens.map((item) => {
                        const comprovanteItem = comprovantes.find(c => c.romaneio_item_id === item.id);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <p className="font-medium">{item.cliente}</p>
                              {item.telefone_cliente && (
                                <p className="text-xs text-muted-foreground">{item.telefone_cliente}</p>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{item.endereco_entrega}</TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>
                              {comprovanteItem ? (
                                <Badge className={STATUS_ENTREGA_CONFIG[comprovanteItem.status].color}>
                                  {STATUS_ENTREGA_CONFIG[comprovanteItem.status].label}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pendente</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {!comprovanteItem && selectedRomaneio?.status === "em_transito" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setIsComprovanteOpen(true);
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Item Dialog */}
          <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Item ao Romaneio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cliente *</Label>
                  <Input
                    value={newItem.cliente}
                    onChange={(e) => setNewItem({ ...newItem, cliente: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <Label>Endereço de Entrega *</Label>
                  <Textarea
                    value={newItem.endereco_entrega}
                    onChange={(e) => setNewItem({ ...newItem, endereco_entrega: e.target.value })}
                    placeholder="Endereço completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contato</Label>
                    <Input
                      value={newItem.contato_cliente}
                      onChange={(e) => setNewItem({ ...newItem, contato_cliente: e.target.value })}
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={newItem.telefone_cliente}
                      onChange={(e) => setNewItem({ ...newItem, telefone_cliente: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={newItem.quantidade}
                      onChange={(e) => setNewItem({ ...newItem, quantidade: parseInt(e.target.value) || 1 })}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label>Pedido</Label>
                    <Input
                      value={newItem.pedido_referencia}
                      onChange={(e) => setNewItem({ ...newItem, pedido_referencia: e.target.value })}
                      placeholder="PED-001"
                    />
                  </div>
                  <div>
                    <Label>NF Saída</Label>
                    <Input
                      value={newItem.nf_saida}
                      onChange={(e) => setNewItem({ ...newItem, nf_saida: e.target.value })}
                      placeholder="123456"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewItemOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={() => selectedRomaneio && addItemMutation.mutate({ 
                    ...newItem, 
                    romaneio_id: selectedRomaneio.id 
                  })}
                  disabled={!newItem.cliente || !newItem.endereco_entrega}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Comprovante Dialog */}
          <Dialog open={isComprovanteOpen} onOpenChange={setIsComprovanteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Entrega</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedItem?.cliente}</p>
                  <p className="text-sm text-muted-foreground">{selectedItem?.endereco_entrega}</p>
                </div>
                <div>
                  <Label>Status da Entrega</Label>
                  <Select
                    value={comprovante.status}
                    onValueChange={(v: StatusEntrega) => setComprovante({ ...comprovante, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entregue">Entregue</SelectItem>
                      <SelectItem value="parcial">Entrega Parcial</SelectItem>
                      <SelectItem value="recusado">Recusado</SelectItem>
                      <SelectItem value="reagendado">Reagendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {comprovante.status === "entregue" || comprovante.status === "parcial" ? (
                  <>
                    <div>
                      <Label>Nome do Recebedor</Label>
                      <Input
                        value={comprovante.recebedor_nome}
                        onChange={(e) => setComprovante({ ...comprovante, recebedor_nome: e.target.value })}
                        placeholder="Nome de quem recebeu"
                      />
                    </div>
                    <div>
                      <Label>Documento</Label>
                      <Input
                        value={comprovante.recebedor_documento}
                        onChange={(e) => setComprovante({ ...comprovante, recebedor_documento: e.target.value })}
                        placeholder="CPF ou RG"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <Label>Motivo</Label>
                    <Textarea
                      value={comprovante.motivo_recusa}
                      onChange={(e) => setComprovante({ ...comprovante, motivo_recusa: e.target.value })}
                      placeholder="Motivo da recusa ou reagendamento..."
                    />
                  </div>
                )}
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={comprovante.observacoes}
                    onChange={(e) => setComprovante({ ...comprovante, observacoes: e.target.value })}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComprovanteOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={() => selectedRomaneio && selectedItem && registrarEntregaMutation.mutate({
                    romaneio_id: selectedRomaneio.id,
                    romaneio_item_id: selectedItem.id,
                    status: comprovante.status,
                    recebedor_nome: comprovante.recebedor_nome,
                    recebedor_documento: comprovante.recebedor_documento,
                    observacoes: comprovante.observacoes,
                    motivo_recusa: comprovante.motivo_recusa,
                  })}
                >
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Comprovantes Tab */}
        <TabsContent value="comprovantes">
          <Card>
            <CardHeader>
              <CardTitle>Comprovantes de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Romaneio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recebedor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprovantes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum comprovante registrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    comprovantes.map((comp) => {
                      const item = romaneioItens.find(i => i.id === comp.romaneio_item_id);
                      return (
                        <TableRow key={comp.id}>
                          <TableCell>{selectedRomaneio?.codigo}</TableCell>
                          <TableCell>{item?.cliente || "-"}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_ENTREGA_CONFIG[comp.status].color}>
                              {STATUS_ENTREGA_CONFIG[comp.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {comp.recebedor_nome || "-"}
                            {comp.recebedor_documento && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({comp.recebedor_documento})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {comp.data_entrega 
                              ? format(new Date(comp.data_entrega), "dd/MM/yyyy HH:mm")
                              : "-"
                            }
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
      </Tabs>
    </motion.div>
  );
}

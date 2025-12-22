// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useRomaneios, Romaneio, RomaneioItem, StatusRomaneio, StatusEntrega } from "@/hooks/useRomaneios";
import { 
  Truck, 
  Package, 
  MapPin, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
  FileText,
  User,
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<StatusRomaneio, { label: string; color: string; icon: React.ReactNode }> = {
  rascunho: { label: "Rascunho", color: "bg-muted", icon: <FileText className="h-4 w-4" /> },
  confirmado: { label: "Confirmado", color: "bg-blue-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  em_transito: { label: "Em Trânsito", color: "bg-amber-500", icon: <Truck className="h-4 w-4" /> },
  entregue: { label: "Entregue", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  parcial: { label: "Parcial", color: "bg-orange-500", icon: <AlertTriangle className="h-4 w-4" /> },
  cancelado: { label: "Cancelado", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
};

const statusEntregaConfig: Record<StatusEntrega, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_rota: { label: "Em Rota", variant: "default" },
  entregue: { label: "Entregue", variant: "default" },
  recusado: { label: "Recusado", variant: "destructive" },
  parcial: { label: "Parcial", variant: "outline" },
  reagendado: { label: "Reagendado", variant: "secondary" },
};

export default function RomaneiosPage() {
  const {
    romaneios,
    loading,
    error,
    criarRomaneio,
    atualizarRomaneio,
    iniciarRomaneio,
    finalizarEntrega,
    cancelarRomaneio,
    adicionarItem,
    removerItem,
    refetch,
  } = useRomaneios();

  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [romaneioSelecionado, setRomaneioSelecionado] = useState<Romaneio | null>(null);
  const [novoRomaneioOpen, setNovoRomaneioOpen] = useState(false);
  const [novoRomaneio, setNovoRomaneio] = useState({
    motorista: "",
    placa_veiculo: "",
    tipo_veiculo: "",
    data_prevista_entrega: "",
    rota: "",
  });

  // Filtrar romaneios
  const romaneiosFiltrados = romaneios.filter(r => {
    const matchStatus = filtroStatus === "todos" || r.status === filtroStatus;
    const matchBusca = !busca || 
      r.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      r.motorista?.toLowerCase().includes(busca.toLowerCase()) ||
      r.placa_veiculo?.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  // Estatísticas
  const stats = {
    total: romaneios.length,
    emTransito: romaneios.filter(r => r.status === "em_transito").length,
    entregas: romaneios.reduce((acc, r) => acc + r.entregas_realizadas, 0),
    pendentes: romaneios.reduce((acc, r) => acc + (r.total_entregas - r.entregas_realizadas), 0),
  };

  const handleCriarRomaneio = async () => {
    try {
      await criarRomaneio(novoRomaneio);
      setNovoRomaneioOpen(false);
      setNovoRomaneio({
        motorista: "",
        placa_veiculo: "",
        tipo_veiculo: "",
        data_prevista_entrega: "",
        rota: "",
      });
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const handleIniciarRomaneio = async (id: string) => {
    await iniciarRomaneio(id);
  };

  const handleFinalizarEntrega = async (romaneioId: string, itemId: string, status: StatusEntrega) => {
    await finalizarEntrega(romaneioId, itemId, status);
  };

  if (loading) {
    return (
      <AppLayout title="Romaneios" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Romaneios de Entrega" showBack>
      <div className="p-4 space-y-6 lg:pl-72">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Romaneios de Entrega
            </h1>
            <p className="text-muted-foreground">
              Gerencie as rotas e entregas
            </p>
          </div>
          <Button onClick={() => setNovoRomaneioOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Romaneio
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Trânsito</p>
                  <p className="text-2xl font-bold text-amber-500">{stats.emTransito}</p>
                </div>
                <Truck className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entregas Realizadas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.entregas}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-muted-foreground">{stats.pendentes}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, motorista ou placa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="em_transito">Em Trânsito</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de romaneios */}
        <div className="space-y-4">
          {romaneiosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum romaneio encontrado</p>
                <Button onClick={() => setNovoRomaneioOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Romaneio
                </Button>
              </CardContent>
            </Card>
          ) : (
            romaneiosFiltrados.map((romaneio) => {
              const config = statusConfig[romaneio.status];
              const progresso = romaneio.total_entregas > 0
                ? (romaneio.entregas_realizadas / romaneio.total_entregas) * 100
                : 0;

              return (
                <Card key={romaneio.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className={config.color}>
                            {config.icon}
                            <span className="ml-1">{config.label}</span>
                          </Badge>
                          <span className="font-mono font-bold">{romaneio.codigo}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {romaneio.motorista && (
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {romaneio.motorista}
                            </span>
                          )}
                          {romaneio.placa_veiculo && (
                            <span className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              {romaneio.placa_veiculo}
                            </span>
                          )}
                          {romaneio.rota && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {romaneio.rota}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Entregas: {romaneio.entregas_realizadas}/{romaneio.total_entregas}</span>
                            <span>{romaneio.total_volumes} volumes • {romaneio.total_peso_kg.toFixed(1)} kg</span>
                          </div>
                          <Progress value={progresso} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {romaneio.status === "confirmado" && (
                          <Button onClick={() => handleIniciarRomaneio(romaneio.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => setRomaneioSelecionado(romaneio)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Dialog Novo Romaneio */}
        <Dialog open={novoRomaneioOpen} onOpenChange={setNovoRomaneioOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Romaneio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Motorista</Label>
                <Input
                  value={novoRomaneio.motorista}
                  onChange={(e) => setNovoRomaneio({ ...novoRomaneio, motorista: e.target.value })}
                  placeholder="Nome do motorista"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placa do Veículo</Label>
                  <Input
                    value={novoRomaneio.placa_veiculo}
                    onChange={(e) => setNovoRomaneio({ ...novoRomaneio, placa_veiculo: e.target.value })}
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <Label>Tipo de Veículo</Label>
                  <Select
                    value={novoRomaneio.tipo_veiculo}
                    onValueChange={(v) => setNovoRomaneio({ ...novoRomaneio, tipo_veiculo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moto">Moto</SelectItem>
                      <SelectItem value="carro">Carro</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="caminhao">Caminhão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Data Prevista</Label>
                <Input
                  type="date"
                  value={novoRomaneio.data_prevista_entrega}
                  onChange={(e) => setNovoRomaneio({ ...novoRomaneio, data_prevista_entrega: e.target.value })}
                />
              </div>
              <div>
                <Label>Rota</Label>
                <Input
                  value={novoRomaneio.rota}
                  onChange={(e) => setNovoRomaneio({ ...novoRomaneio, rota: e.target.value })}
                  placeholder="Descrição da rota"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNovoRomaneioOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCriarRomaneio}>
                Criar Romaneio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Detalhes do Romaneio */}
        <Dialog open={!!romaneioSelecionado} onOpenChange={() => setRomaneioSelecionado(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {romaneioSelecionado && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Romaneio {romaneioSelecionado.codigo}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Info do romaneio */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Motorista</p>
                      <p className="font-medium">{romaneioSelecionado.motorista || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Veículo</p>
                      <p className="font-medium">{romaneioSelecionado.placa_veiculo || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volumes</p>
                      <p className="font-medium">{romaneioSelecionado.total_volumes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peso Total</p>
                      <p className="font-medium">{romaneioSelecionado.total_peso_kg.toFixed(1)} kg</p>
                    </div>
                  </div>

                  {/* Lista de entregas */}
                  <div>
                    <h3 className="font-medium mb-2">Entregas ({romaneioSelecionado.itens.length})</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Endereço</TableHead>
                          <TableHead>Volumes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {romaneioSelecionado.itens.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.ordem_entrega || index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.cliente}</p>
                                {item.telefone_cliente && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {item.telefone_cliente}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {item.endereco_entrega}
                            </TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>
                              <Badge variant={statusEntregaConfig[item.status || "pendente"].variant}>
                                {statusEntregaConfig[item.status || "pendente"].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {romaneioSelecionado.status === "em_transito" && item.status === "pendente" && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleFinalizarEntrega(romaneioSelecionado.id, item.id, "entregue")}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleFinalizarEntrega(romaneioSelecionado.id, item.id, "recusado")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

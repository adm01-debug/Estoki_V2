import { RomaneiosCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { useState } from "react";
import { romaneioSchema, validateForm } from "@/lib/validations";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoader } from "@/components/common/AsyncStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useRomaneios } from "@/features/shipping/hooks/useRomaneios";
import type {
  Romaneio,
  StatusRomaneio,
  StatusEntrega,
} from "@/features/shipping/hooks/useRomaneios";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  FileText,
  User,
  MapPin,
  ChevronRight,
  BarChart3,
  Navigation,
  ExternalLink,
  Printer,
  Share2,
  MoreHorizontal,
  LayoutGrid,
  List,
  RefreshCw,
  Package,
} from "lucide-react";
import { NovoRomaneioDialog } from "@/components/romaneios/NovoRomaneioDialog";
import { RomaneioDetalhesDialog } from "@/components/romaneios/RomaneioDetalhesDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const statusConfig: Record<
  StatusRomaneio,
  { label: string; color: string; icon: React.ReactNode }
> = {
  rascunho: { label: "Rascunho", color: "bg-muted", icon: <FileText className="h-4 w-4" /> },
  confirmado: {
    label: "Confirmado",
    color: "bg-blue-500",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  em_transito: { label: "Em Trânsito", color: "bg-amber-500", icon: <Truck className="h-4 w-4" /> },
  entregue: {
    label: "Entregue",
    color: "bg-green-500",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  parcial: {
    label: "Parcial",
    color: "bg-orange-500",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  cancelado: { label: "Cancelado", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
};

export default function RomaneiosPage() {
  const { romaneios, loading, criarRomaneio, atualizarStatus, registrarEntrega, refetch } =
    useRomaneios();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [romaneioSelecionado, setRomaneioSelecionado] = useState<Romaneio | null>(null);
  const [novoRomaneioOpen, setNovoRomaneioOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [novoRomaneio, setNovoRomaneio] = useState({
    motorista: "",
    placa_veiculo: "",
    tipo_veiculo: "",
    data_prevista_entrega: "",
    rota: "",
  });

  const romaneiosFiltrados = romaneios.filter((r) => {
    const matchStatus = filtroStatus === "todos" || r.status === filtroStatus;
    const matchBusca =
      !busca ||
      r.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      r.motorista?.toLowerCase().includes(busca.toLowerCase()) ||
      r.placa_veiculo?.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const stats = {
    total: romaneios.length,
    emTransito: romaneios.filter((r) => r.status === "em_transito").length,
    entregas: romaneios.reduce((acc, r) => acc + (r.entregas_realizadas || 0), 0),
    pendentes: romaneios.reduce(
      (acc, r) => acc + ((r.total_entregas || 0) - (r.entregas_realizadas || 0)),
      0
    ),
  };

  const handleCriarRomaneio = async () => {
    const validation = validateForm(romaneioSchema, novoRomaneio);
    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors({});
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
    } catch {
      // Submission error handled by toast notifications
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setNovoRomaneio((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (loading)
    return (
      <AppLayout title="Romaneios" showBack>
        <PageLoader message="Carregando romaneios..." />
      </AppLayout>
    );

  return (
    <AppLayout title="Romaneios de Entrega" showBack>
      <SEO
        title="Romaneios"
        description="Gestão de romaneios de entrega, motoristas e rotas."
        path="/romaneios"
      />
      <div className="space-y-6 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
              <div className="rounded-xl bg-primary/10 p-2">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              Romaneios de Entrega
            </h1>
            <p className="mt-1 text-muted-foreground">
              Orquestração de logística e distribuição de última milha
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsRefreshing(true);
                setTimeout(() => {
                  refetch();
                  setIsRefreshing(false);
                }, 1000);
              }}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              className="bg-primary shadow-lg shadow-primary/20 transition-transform hover:scale-105"
              onClick={() => setNovoRomaneioOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Romaneio
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            {
              label: "Total Geral",
              value: stats.total,
              color: "text-slate-900",
              bg: "bg-slate-50",
              icon: FileText,
            },
            {
              label: "Em Trânsito",
              value: stats.emTransito,
              color: "text-blue-600",
              bg: "bg-blue-50",
              icon: Truck,
              trend: "+12%",
            },
            {
              label: "Entregues",
              value: stats.entregas,
              color: "text-green-600",
              bg: "bg-green-50",
              icon: CheckCircle2,
              sub: "Hoje",
            },
            {
              label: "Ocupação Frota",
              value: "88%",
              color: "text-purple-600",
              bg: "bg-purple-50",
              icon: BarChart3,
            },
          ].map((s, idx) => (
            <Card key={idx} className="group overflow-hidden border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`${s.bg} rounded-2xl p-3 transition-transform group-hover:scale-110`}
                >
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    {s.trend && (
                      <span className="text-[10px] font-bold text-green-500">{s.trend}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {romaneios.length > 0 && <RomaneiosCharts romaneios={romaneios} />}

        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-white p-2 shadow-sm md:flex-row">
          <div className="flex w-full flex-1 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar romaneios..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="border-none bg-muted/30 pl-10 focus-visible:ring-1"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48 border-none bg-muted/30">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="em_transito">Em Trânsito</SelectItem>
                <SelectItem value="entregue">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 shadow-sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          <AnimatePresence>
            {romaneiosFiltrados.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <Truck className="mx-auto mb-4 h-16 w-16 text-muted-foreground/20" />
                <p className="font-medium text-muted-foreground">
                  Nenhum romaneio atende aos filtros aplicados.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setBusca("");
                    setFiltroStatus("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              romaneiosFiltrados.map((romaneio, idx) => {
                const config = statusConfig[romaneio.status];
                const progresso =
                  romaneio.total_entregas > 0
                    ? (romaneio.entregas_realizadas / romaneio.total_entregas) * 100
                    : 0;

                if (viewMode === "grid") {
                  return (
                    <motion.div
                      key={romaneio.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="overflow-hidden border-t-4 border-t-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <CardContent className="p-0">
                          <div className="space-y-4 p-5">
                            <div className="flex items-center justify-between">
                              <Badge
                                className={`${config.color} rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white`}
                              >
                                {config.label}
                              </Badge>
                              <span className="font-mono text-sm font-black text-muted-foreground">
                                #{romaneio.codigo}
                              </span>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                                  {romaneio.motorista?.charAt(0) || "M"}
                                </div>
                                <div>
                                  <p className="text-sm font-bold leading-none">
                                    {romaneio.motorista || "Sem motorista"}
                                  </p>
                                  <p className="mt-1 text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
                                    {romaneio.placa_veiculo} • {romaneio.rota || "Rota não def."}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                  <span>Progresso da Rota</span>
                                  <span className="text-primary">{progresso.toFixed(0)}%</span>
                                </div>
                                <Progress value={progresso} className="h-1.5" />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>
                                    {romaneio.entregas_realizadas} de {romaneio.total_entregas}{" "}
                                    paradas
                                  </span>
                                  <span className="font-bold text-slate-700">
                                    {romaneio.total_peso_kg.toFixed(0)}kg total
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 border-t bg-muted/30 p-3">
                            {romaneio.status === "confirmado" && (
                              <Button
                                className="h-9 flex-1 bg-primary"
                                onClick={() => atualizarStatus(romaneio.id, "em_transito")}
                              >
                                <Play className="mr-2 h-3 w-3" /> Iniciar Rota
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="h-9 flex-1 border shadow-sm"
                              onClick={() => setRomaneioSelecionado(romaneio)}
                            >
                              Detalhes
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" /> Imprimir Romaneio
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Navigation className="mr-2 h-4 w-4" /> Visualizar no Mapa
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="mr-2 h-4 w-4" /> Compartilhar Rastreio
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="mr-2 h-4 w-4" /> Cancelar Rota
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                }

                // List View Mode
                return (
                  <Card key={romaneio.id} className="transition-colors hover:border-primary/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className={config.color}>{config.label}</Badge>
                            <span className="font-mono font-bold">{romaneio.codigo}</span>
                            <span className="border-l pl-3 text-xs font-medium text-muted-foreground">
                              {romaneio.rota}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {romaneio.motorista}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {romaneio.placa_veiculo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {romaneio.total_volumes} vol
                            </span>
                          </div>
                        </div>
                        <div className="w-full space-y-1 md:w-64">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>
                              {romaneio.entregas_realizadas}/{romaneio.total_entregas} Paradas
                            </span>
                            <span>{progresso.toFixed(0)}%</span>
                          </div>
                          <Progress value={progresso} className="h-1.5" />
                        </div>
                        <div className="flex gap-2">
                          {romaneio.status === "confirmado" && (
                            <Button
                              size="sm"
                              onClick={() => atualizarStatus(romaneio.id, "em_transito")}
                            >
                              <Play className="mr-2 h-3 w-3" />
                              Iniciar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRomaneioSelecionado(romaneio)}
                          >
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <NovoRomaneioDialog
          open={novoRomaneioOpen}
          onOpenChange={setNovoRomaneioOpen}
          novoRomaneio={novoRomaneio}
          formErrors={formErrors}
          onFieldChange={handleFieldChange}
          onSubmit={handleCriarRomaneio}
        />
        <RomaneioDetalhesDialog
          romaneio={romaneioSelecionado}
          onClose={() => setRomaneioSelecionado(null)}
          onFinalizarEntrega={(rid, iid, status) => registrarEntrega(rid, iid, status)}
        />
      </div>
    </AppLayout>
  );
}

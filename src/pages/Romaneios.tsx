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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useRomaneios } from "@/features/shipping/hooks/useRomaneios";
import type { Romaneio, StatusRomaneio, StatusEntrega } from "@/features/shipping/hooks/useRomaneios";
import { 
  Truck, Plus, Search, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, Play, FileText, User, MapPin, 
  ChevronRight, BarChart3, Navigation, ExternalLink, Printer, Share2, MoreHorizontal, LayoutGrid, List
} from "lucide-react";
import { NovoRomaneioDialog } from "@/components/romaneios/NovoRomaneioDialog";
import { RomaneioDetalhesDialog } from "@/components/romaneios/RomaneioDetalhesDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const statusConfig: Record<StatusRomaneio, { label: string; color: string; icon: React.ReactNode }> = {
  rascunho: { label: "Rascunho", color: "bg-muted", icon: <FileText className="h-4 w-4" /> },
  confirmado: { label: "Confirmado", color: "bg-blue-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  em_transito: { label: "Em Trânsito", color: "bg-amber-500", icon: <Truck className="h-4 w-4" /> },
  entregue: { label: "Entregue", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  parcial: { label: "Parcial", color: "bg-orange-500", icon: <AlertTriangle className="h-4 w-4" /> },
  cancelado: { label: "Cancelado", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
};

export default function RomaneiosPage() {
  const { romaneios, loading, criarRomaneio, atualizarStatus, registrarEntrega, refetch } = useRomaneios();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [romaneioSelecionado, setRomaneioSelecionado] = useState<Romaneio | null>(null);
  const [novoRomaneioOpen, setNovoRomaneioOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [novoRomaneio, setNovoRomaneio] = useState({ motorista: "", placa_veiculo: "", tipo_veiculo: "", data_prevista_entrega: "", rota: "" });

  const romaneiosFiltrados = romaneios.filter(r => {
    const matchStatus = filtroStatus === "todos" || r.status === filtroStatus;
    const matchBusca = !busca || r.codigo.toLowerCase().includes(busca.toLowerCase()) || r.motorista?.toLowerCase().includes(busca.toLowerCase()) || r.placa_veiculo?.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const stats = { 
    total: romaneios.length, 
    emTransito: romaneios.filter(r => r.status === "em_transito").length, 
    entregas: romaneios.reduce((acc, r) => acc + (r.entregas_realizadas || 0), 0), 
    pendentes: romaneios.reduce((acc, r) => acc + ((r.total_entregas || 0) - (r.entregas_realizadas || 0)), 0) 
  };

  const handleCriarRomaneio = async () => {
    const validation = validateForm(romaneioSchema, novoRomaneio);
    if (!validation.success) { setFormErrors(validation.errors); return; }
    setFormErrors({});
    try { await criarRomaneio(novoRomaneio); setNovoRomaneioOpen(false); setNovoRomaneio({ motorista: "", placa_veiculo: "", tipo_veiculo: "", data_prevista_entrega: "", rota: "" }); } catch {}
  };

  const handleFieldChange = (field: string, value: string) => {
    setNovoRomaneio(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  if (loading) return <AppLayout title="Romaneios" showBack><PageLoader message="Carregando romaneios..." /></AppLayout>;

  return (
    <AppLayout title="Romaneios de Entrega" showBack>
      <SEO title="Romaneios" description="Gestão de romaneios de entrega, motoristas e rotas." path="/romaneios" />
      <div className="p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              Romaneios de Entrega
            </h1>
            <p className="text-muted-foreground mt-1">Orquestração de logística e distribuição de última milha</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => { setIsRefreshing(true); setTimeout(() => { refetch(); setIsRefreshing(false); }, 1000); }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button className="shadow-lg shadow-primary/20 bg-primary hover:scale-105 transition-transform" onClick={() => setNovoRomaneioOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Novo Romaneio
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Geral", value: stats.total, color: "text-slate-900", bg: "bg-slate-50", icon: FileText },
            { label: "Em Trânsito", value: stats.emTransito, color: "text-blue-600", bg: "bg-blue-50", icon: Truck, trend: "+12%" },
            { label: "Entregues", value: stats.entregas, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2, sub: "Hoje" },
            { label: "Ocupação Frota", value: "88%", color: "text-purple-600", bg: "bg-purple-50", icon: BarChart3 },
          ].map((s, idx) => (
            <Card key={idx} className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`${s.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{s.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    {s.trend && <span className="text-[10px] font-bold text-green-500">{s.trend}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {romaneios.length > 0 && <RomaneiosCharts romaneios={romaneios} />}

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-xl border shadow-sm">
          <div className="flex gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filtrar romaneios..." 
                value={busca} 
                onChange={e => setBusca(e.target.value)} 
                className="pl-10 border-none bg-muted/30 focus-visible:ring-1" 
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48 border-none bg-muted/30">
                <Filter className="h-4 w-4 mr-2" />
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
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
             <Button variant={viewMode === "grid" ? "white" : "ghost"} size="icon" className="h-8 w-8 shadow-sm" onClick={() => setViewMode("grid")}>
               <LayoutGrid className="h-4 w-4" />
             </Button>
             <Button variant={viewMode === "list" ? "white" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
               <List className="h-4 w-4" />
             </Button>
          </div>
        </div>

        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          <AnimatePresence>
            {romaneiosFiltrados.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <Truck className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum romaneio atende aos filtros aplicados.</p>
                <Button variant="link" onClick={() => { setBusca(""); setFiltroStatus("todos"); }}>Limpar filtros</Button>
              </div>
            ) : romaneiosFiltrados.map((romaneio, idx) => {
              const config = statusConfig[romaneio.status];
              const progresso = romaneio.total_entregas > 0 ? (romaneio.entregas_realizadas / romaneio.total_entregas) * 100 : 0;
              
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
                    <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-t-4 border-t-primary/20">
                      <CardContent className="p-0">
                        <div className="p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge className={`${config.color} text-white px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest`}>
                              {config.label}
                            </Badge>
                            <span className="font-mono font-black text-sm text-muted-foreground">#{romaneio.codigo}</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                 {romaneio.motorista?.charAt(0) || "M"}
                               </div>
                               <div>
                                 <p className="font-bold text-sm leading-none">{romaneio.motorista || "Sem motorista"}</p>
                                 <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter">{romaneio.placa_veiculo} • {romaneio.rota || "Rota não def."}</p>
                               </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-bold">
                                <span>Progresso da Rota</span>
                                <span className="text-primary">{progresso.toFixed(0)}%</span>
                              </div>
                              <Progress value={progresso} className="h-1.5" />
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{romaneio.entregas_realizadas} de {romaneio.total_entregas} paradas</span>
                                <span className="font-bold text-slate-700">{romaneio.total_peso_kg.toFixed(0)}kg total</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 p-3 flex gap-2 border-t">
                          {romaneio.status === "confirmado" && (
                            <Button className="flex-1 h-9 bg-primary" onClick={() => atualizarStatus(romaneio.id, 'em_transito')}>
                              <Play className="h-3 w-3 mr-2" /> Iniciar Rota
                            </Button>
                          )}
                          <Button variant="white" className="flex-1 h-9 border shadow-sm" onClick={() => setRomaneioSelecionado(romaneio)}>
                            Detalhes
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem><Printer className="h-4 w-4 mr-2" /> Imprimir Romaneio</DropdownMenuItem>
                              <DropdownMenuItem><Navigation className="h-4 w-4 mr-2" /> Visualizar no Mapa</DropdownMenuItem>
                              <DropdownMenuItem><Share2 className="h-4 w-4 mr-2" /> Compartilhar Rastreio</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive"><XCircle className="h-4 w-4 mr-2" /> Cancelar Rota</DropdownMenuItem>
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
                <Card key={romaneio.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className={config.color}>{config.label}</Badge>
                          <span className="font-mono font-bold">{romaneio.codigo}</span>
                          <span className="text-xs text-muted-foreground border-l pl-3 font-medium">{romaneio.rota}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{romaneio.motorista}</span>
                          <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{romaneio.placa_veiculo}</span>
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{romaneio.total_volumes} vol</span>
                        </div>
                      </div>
                      <div className="w-full md:w-64 space-y-1">
                         <div className="flex justify-between text-[10px] font-bold">
                            <span>{romaneio.entregas_realizadas}/{romaneio.total_entregas} Paradas</span>
                            <span>{progresso.toFixed(0)}%</span>
                         </div>
                         <Progress value={progresso} className="h-1.5" />
                      </div>
                      <div className="flex gap-2">
                        {romaneio.status === "confirmado" && <Button size="sm" onClick={() => atualizarStatus(romaneio.id, 'em_transito')}><Play className="h-3 w-3 mr-2" />Iniciar</Button>}
                        <Button variant="outline" size="sm" onClick={() => setRomaneioSelecionado(romaneio)}>Gerenciar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </AnimatePresence>
        </div>

        <NovoRomaneioDialog open={novoRomaneioOpen} onOpenChange={setNovoRomaneioOpen} novoRomaneio={novoRomaneio} formErrors={formErrors} onFieldChange={handleFieldChange} onSubmit={handleCriarRomaneio} />
        <RomaneioDetalhesDialog romaneio={romaneioSelecionado} onClose={() => setRomaneioSelecionado(null)} onFinalizarEntrega={(rid, iid, status) => registrarEntrega(rid, iid, status)} />
      </div>
    </AppLayout>
  );
}

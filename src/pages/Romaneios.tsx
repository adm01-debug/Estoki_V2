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
import { useRomaneios, Romaneio, StatusRomaneio, StatusEntrega } from "@/hooks/useRomaneios";
import { Truck, Plus, Search, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, Play, FileText, User, MapPin } from "lucide-react";
import { NovoRomaneioDialog } from "@/components/romaneios/NovoRomaneioDialog";
import { RomaneioDetalhesDialog } from "@/components/romaneios/RomaneioDetalhesDialog";
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
  const [romaneioSelecionado, setRomaneioSelecionado] = useState<Romaneio | null>(null);
  const [novoRomaneioOpen, setNovoRomaneioOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [novoRomaneio, setNovoRomaneio] = useState({ motorista: "", placa_veiculo: "", tipo_veiculo: "", data_prevista_entrega: "", rota: "" });

  const romaneiosFiltrados = romaneios.filter(r => {
    const matchStatus = filtroStatus === "todos" || r.status === filtroStatus;
    const matchBusca = !busca || r.codigo.toLowerCase().includes(busca.toLowerCase()) || r.motorista?.toLowerCase().includes(busca.toLowerCase()) || r.placa_veiculo?.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const stats = { total: romaneios.length, emTransito: romaneios.filter(r => r.status === "em_transito").length, entregas: romaneios.reduce((acc, r) => acc + r.entregas_realizadas, 0), pendentes: romaneios.reduce((acc, r) => acc + (r.total_entregas - r.entregas_realizadas), 0) };

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
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-primary" />Romaneios de Entrega</h1><p className="text-muted-foreground">Gerencie as rotas e entregas</p></div>
          <Button onClick={() => setNovoRomaneioOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Romaneio</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div><FileText className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Em Trânsito</p><p className="text-2xl font-bold text-amber-500">{stats.emTransito}</p></div><Truck className="h-8 w-8 text-amber-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Entregas Realizadas</p><p className="text-2xl font-bold text-green-500">{stats.entregas}</p></div><CheckCircle2 className="h-8 w-8 text-green-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-muted-foreground">{stats.pendentes}</p></div><Clock className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        </div>

        {romaneios.length > 0 && <RomaneiosCharts romaneios={romaneios} />}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por código, motorista ou placa..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" /></div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}><SelectTrigger className="w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filtrar status" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="rascunho">Rascunho</SelectItem><SelectItem value="confirmado">Confirmado</SelectItem><SelectItem value="em_transito">Em Trânsito</SelectItem><SelectItem value="entregue">Entregue</SelectItem><SelectItem value="parcial">Parcial</SelectItem><SelectItem value="cancelado">Cancelado</SelectItem></SelectContent></Select>
        </div>

        <div className="space-y-4">
          {romaneiosFiltrados.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum romaneio encontrado</p><Button onClick={() => setNovoRomaneioOpen(true)} className="mt-4"><Plus className="h-4 w-4 mr-2" />Criar Romaneio</Button></CardContent></Card>
          ) : romaneiosFiltrados.map(romaneio => {
            const config = statusConfig[romaneio.status];
            const progresso = romaneio.total_entregas > 0 ? (romaneio.entregas_realizadas / romaneio.total_entregas) * 100 : 0;
            return (
              <Card key={romaneio.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3"><Badge className={config.color}>{config.icon}<span className="ml-1">{config.label}</span></Badge><span className="font-mono font-bold">{romaneio.codigo}</span></div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {romaneio.motorista && <span className="flex items-center gap-1"><User className="h-4 w-4" />{romaneio.motorista}</span>}
                        {romaneio.placa_veiculo && <span className="flex items-center gap-1"><Truck className="h-4 w-4" />{romaneio.placa_veiculo}</span>}
                        {romaneio.rota && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{romaneio.rota}</span>}
                      </div>
                      <div className="space-y-1"><div className="flex justify-between text-sm"><span>Entregas: {romaneio.entregas_realizadas}/{romaneio.total_entregas}</span><span>{romaneio.total_volumes} volumes • {romaneio.total_peso_kg.toFixed(1)} kg</span></div><Progress value={progresso} /></div>
                    </div>
                    <div className="flex gap-2">
                      {romaneio.status === "confirmado" && <Button onClick={() => atualizarStatus(romaneio.id, 'em_transito')}><Play className="h-4 w-4 mr-2" />Iniciar</Button>}
                      <Button variant="outline" onClick={() => setRomaneioSelecionado(romaneio)}>Ver Detalhes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <NovoRomaneioDialog open={novoRomaneioOpen} onOpenChange={setNovoRomaneioOpen} novoRomaneio={novoRomaneio} formErrors={formErrors} onFieldChange={handleFieldChange} onSubmit={handleCriarRomaneio} />
        <RomaneioDetalhesDialog romaneio={romaneioSelecionado} onClose={() => setRomaneioSelecionado(null)} onFinalizarEntrega={(rid, iid, status) => registrarEntrega(rid, iid, status)} />
      </div>
    </AppLayout>
  );
}

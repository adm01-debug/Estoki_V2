import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useInventarioCiclico, TipoCiclo } from "@/hooks/useInventarioCiclico";
import { ClipboardList, Plus, Calendar as CalendarIcon, Play, CheckCircle, Target, Search, Filter, Loader2, Pause } from "lucide-react";
import { NovoCicloDialog } from "@/components/inventario/NovoCicloDialog";
import { CicloCard } from "@/components/inventario/CicloCard";
import { InventarioDashboardTab } from "@/components/inventario/InventarioDashboardTab";
import { InventarioConfigTab } from "@/components/inventario/InventarioConfigTab";

export default function InventarioCiclicoPage() {
  const navigate = useNavigate();
  const { ciclos, loading, criarCiclo, iniciarCiclo, pausarCiclo } = useInventarioCiclico();

  const [tab, setTab] = useState("ciclos");
  const [showNewCicloDialog, setShowNewCicloDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const ciclosFiltrados = useMemo(() => ciclos.filter(ciclo => {
    const matchSearch = ciclo.nome.toLowerCase().includes(searchTerm.toLowerCase()) || (ciclo.descricao?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === "todos" || ciclo.status === statusFilter;
    return matchSearch && matchStatus;
  }), [ciclos, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const agendados = ciclos.filter(c => c.status === "agendado").length;
    const emAndamento = ciclos.filter(c => c.status === "em_andamento").length;
    const concluidos = ciclos.filter(c => c.status === "concluido").length;
    const acuracidadeMedia = ciclos.filter(c => c.acuracidade !== null).reduce((acc, c) => acc + (c.acuracidade || 0), 0) / Math.max(1, ciclos.filter(c => c.acuracidade !== null).length);
    return { agendados, emAndamento, concluidos, acuracidadeMedia };
  }, [ciclos]);

  const handleIniciarCiclo = async (id: string) => {
    const success = await iniciarCiclo(id);
    if (success) toast({ title: "Inventário Iniciado", description: "O ciclo de inventário foi iniciado" });
  };

  const handlePausarCiclo = async (id: string) => {
    const success = await pausarCiclo(id);
    if (success) toast({ title: "Inventário Pausado", description: "O ciclo foi pausado" });
  };

  if (loading) {
    return (
      <AppLayout title="Inventário Cíclico" showBack>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Inventário Cíclico" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Controle de Inventário</h2>
              <p className="text-sm text-muted-foreground">Gerencie ciclos de contagem</p>
            </div>
            <Button onClick={() => setShowNewCicloDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Novo Ciclo</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CalendarIcon, label: "Agendados", value: stats.agendados, color: "bg-blue-500/10", textColor: "text-blue-500" },
              { icon: Play, label: "Em Andamento", value: stats.emAndamento, color: "bg-amber-500/10", textColor: "text-amber-500" },
              { icon: CheckCircle, label: "Concluídos", value: stats.concluidos, color: "bg-green-500/10", textColor: "text-green-500" },
              { icon: Target, label: "Acuracidade", value: `${stats.acuracidadeMedia.toFixed(1)}%`, color: "bg-primary/10", textColor: "text-primary" },
            ].map(({ icon: Icon, label, value, color, textColor }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}><Icon className={`h-5 w-5 ${textColor}`} /></div>
                    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ciclos">Ciclos</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="ciclos" className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar ciclos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="agendado">Agendados</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluídos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {ciclosFiltrados.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum ciclo encontrado</p>
                  </div>
                ) : (
                  ciclosFiltrados.map((ciclo) => (
                    <CicloCard key={ciclo.id} ciclo={ciclo} onIniciar={handleIniciarCiclo} onPausar={handlePausarCiclo}
                      onContinuar={(id) => navigate(`/inventario/${id}`)} onVerDetalhes={(id) => navigate(`/inventario/${id}`)} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4"><InventarioDashboardTab ciclos={ciclos} /></TabsContent>
            <TabsContent value="config" className="space-y-4"><InventarioConfigTab /></TabsContent>
          </Tabs>
        </div>

        <NovoCicloDialog open={showNewCicloDialog} onOpenChange={setShowNewCicloDialog} criarCiclo={criarCiclo} />
      </PageTransition>
    </AppLayout>
  );
}

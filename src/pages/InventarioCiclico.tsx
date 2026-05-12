 import { useState, useMemo } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { cn } from "@/lib/utils";
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
 import { ClipboardList, Plus, Calendar as CalendarIcon, Play, CheckCircle, Target, Search, Filter, Loader2, Pause, Download, Trash2, CheckSquare } from "lucide-react";
import { NovoCicloDialog } from "@/components/inventario/NovoCicloDialog";
import { CicloCard } from "@/components/inventario/CicloCard";
import { InventarioDashboardTab } from "@/components/inventario/InventarioDashboardTab";
import { InventarioConfigTab } from "@/components/inventario/InventarioConfigTab";

export default function InventarioCiclicoPage() {
  const navigate = useNavigate();
   const { ciclos, loading, criarCiclo, iniciarCiclo, pausarCiclo, deleteCiclo } = useInventarioCiclico();
   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const toggleSelection = (id: string) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
   };
 
   const clearSelection = () => setSelectedIds([]);
 
   const handleExportCSV = () => {
     const headers = ["Nome", "Status", "Tipo", "Acuracidade", "Divergências", "Posições"];
     const rows = ciclosFiltrados.map(c => [c.nome, c.status, c.tipo, `${c.acuracidade || 0}%`, c.divergencias_encontradas || 0, c.total_posicoes || 0]);
     const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement("a");
     link.href = URL.createObjectURL(blob);
     link.setAttribute("download", `inventario_estoki_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };
 

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
             <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2"><Download className="h-4 w-4" /><span className="hidden sm:inline">Exportar</span></Button>
               <Button onClick={() => setShowNewCicloDialog(true)} className="gap-2" size="sm"><Plus className="h-4 w-4" />Novo Ciclo</Button>
             </div>
          </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {selectedIds.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }} 
                 animate={{ opacity: 1, y: 0 }}
                 className="col-span-full flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20 sticky top-0 z-20"
               >
                 <CheckSquare className="h-4 w-4 text-primary" />
                 <span className="text-sm font-medium">{selectedIds.length} selecionado(s)</span>
                 <div className="flex-1" />
                 <Button size="sm" variant="ghost" onClick={clearSelection}>Limpar</Button>
                 <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={async () => {
                   // Assume deleteCiclo exists in hook (will add if not)
                   toast({ title: "Ação não permitida", description: "Use a exclusão individual por enquanto." });
                 }}><Trash2 className="h-3 w-3" />Excluir</Button>
               </motion.div>
             )}
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
                     <div key={ciclo.id} className="relative group">
                       <div 
                         className={cn(
                           "absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity",
                           selectedIds.includes(ciclo.id) && "opacity-100"
                         )}
                         onClick={(e) => { e.stopPropagation(); toggleSelection(ciclo.id); }}
                       >
                         <input type="checkbox" checked={selectedIds.includes(ciclo.id)} readOnly className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                       </div>
                       <div className={cn(selectedIds.includes(ciclo.id) && "pl-8")}>
                         <CicloCard ciclo={ciclo} onIniciar={handleIniciarCiclo} onPausar={handlePausarCiclo}
                           onContinuar={(id) => navigate(`/inventario/${id}`)} onVerDetalhes={(id) => navigate(`/inventario/${id}`)} />
                       </div>
                     </div>
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

 import { tipoLabels } from "@/types/tarefas";
 
 const priorityMap: Record<string, "critical" | "high" | "low" | "medium"> = {
   baixa: "low",
   media: "medium",
   alta: "high",
   urgente: "critical",
 };
 import { Tarefa } from "@/types/tarefas";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Search, Filter, Package, Loader2, Target, LayoutGrid, List, BarChart2 
} from "lucide-react";

import { statusLabels, tipoLabels } from "@/types/tarefas";
import { useGestaoTarefasPage } from "@/hooks/useGestaoTarefasPage";
import { TarefaCard } from "@/components/tarefas/TarefaCard";
import { KanbanBoard } from "@/components/ui/kanban/KanbanBoard";
import { TarefaStats } from "@/components/tarefas/TarefaStats";
import { TarefaCharts } from "@/components/tarefas/TarefaCharts";
import { NovaTarefaDialog } from "@/components/tarefas/NovaTarefaDialog";

export default function GestaoTarefasPage() {
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    filtroStatus,
    setFiltroStatus,
    filtroTipo,
    setFiltroTipo,
    showNovaTarefa,
    setShowNovaTarefa,
    submitting,
    novaTarefa,
    setNovaTarefa,
    stats,
    tarefasFiltradas,
    dadosStatus,
    dadosTipo,
    handleCriarTarefa,
    handleIniciar,
    handleConcluir
  } = useGestaoTarefasPage();

  const [tab, setTab] = useState("kanban");

  if (isLoading) {
    return (
      <AppLayout title="Gestão de Tarefas" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gestão de Tarefas" showBack>
      <div className="p-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Gestão de Tarefas</h2>
            <p className="text-sm text-muted-foreground">Organize e acompanhe as atividades do armazém</p>
          </div>
          <Button onClick={() => setShowNovaTarefa(true)} className="gap-2">
            <Plus className="h-4 w-4" />Nova Tarefa
          </Button>
        </div>

        <TarefaStats stats={stats} />

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kanban" className="gap-2"><LayoutGrid className="h-4 w-4" /> Kanban</TabsTrigger>
            <TabsTrigger value="tarefas" className="gap-2"><List className="h-4 w-4" /> Lista</TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2"><BarChart2 className="h-4 w-4" /> Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-4">
            <KanbanBoard 
              columns={[
                { id: "pendente", title: "Pendentes", color: "bg-slate-500" },
                { id: "em_andamento", title: "Em Andamento", color: "bg-blue-500" },
                { id: "concluida", title: "Concluídas", color: "bg-success" }
              ]}
               items={tarefasFiltradas.map((t: Tarefa) => ({
                 id: t.id,
                 columnId: t.status,
                 title: t.instrucoes || "Sem descrição",
                 description: `Qtd: ${t.quantidade}`,
                 priority: priorityMap[t.prioridade] || "medium",
                 tags: [tipoLabels[t.tipo as keyof typeof tipoLabels] || t.tipo]
               }))}
               renderItem={(item) => {
                 const t = tarefasFiltradas.find((x: Tarefa) => x.id === item.id);
                 if (!t) return null;
                 return (
                   <TarefaCard 
                     tarefa={t} 
                     onIniciar={handleIniciar} 
                     onConcluir={handleConcluir} 
                   />
                 );
               }}
            />
          </TabsContent>

          <TabsContent value="tarefas" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar tarefas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([key, val]) => (<SelectItem key={key} value={key}>{val}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[150px]"><Package className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(tipoLabels).map(([key, val]) => (<SelectItem key={key} value={key}>{val}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {tarefasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma tarefa encontrada</p>
                </div>
              ) : (
               tarefasFiltradas.map((tarefa: Tarefa) => (
                  <TarefaCard 
                    key={tarefa.id} 
                    tarefa={tarefa} 
                    onIniciar={handleIniciar} 
                    onConcluir={handleConcluir} 
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <TarefaCharts dadosStatus={dadosStatus} dadosTipo={dadosTipo} />
          </TabsContent>
        </Tabs>
      </div>

      <NovaTarefaDialog 
        open={showNovaTarefa} 
        onOpenChange={setShowNovaTarefa}
        submitting={submitting}
        novaTarefa={novaTarefa}
        setNovaTarefa={setNovaTarefa}
        onCriar={handleCriarTarefa}
      />
    </AppLayout>
  );
}

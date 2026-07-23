import { useState, useMemo } from "react";
import { SEO } from "@/components/common/SEO";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useInventarioCiclico } from "@/hooks/useInventarioCiclico";
import { Plus, Download, Loader2, ClipboardList } from "lucide-react";
import { NovoCicloDialog } from "@/components/inventario/NovoCicloDialog";
import { CicloCard } from "@/components/inventario/CicloCard";
import { InventarioDashboardTab } from "@/components/inventario/InventarioDashboardTab";
import { InventarioConfigTab } from "@/components/inventario/InventarioConfigTab";
import { InventoryStats } from "@/features/inventory/components/cyclic/InventoryStats";
import { SelectionToolbar } from "@/features/inventory/components/cyclic/SelectionToolbar";
import { InventoryFilters } from "@/features/inventory/components/cyclic/InventoryFilters";
import { cn } from "@/lib/utils";

export default function InventarioCiclicoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ciclos, loading, criarCiclo, iniciarCiclo, pausarCiclo } = useInventarioCiclico();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tab, setTab] = useState("ciclos");
  const [showNewCicloDialog, setShowNewCicloDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleExportCSV = () => {
    const headers = ["Nome", "Status", "Tipo", "Acuracidade", "Divergências", "Posições"];
    const rows = ciclosFiltrados.map((c) => [
      c.nome,
      c.status,
      c.tipo,
      `${c.acuracidade || 0}%`,
      c.divergencias_encontradas || 0,
      c.total_posicoes || 0,
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `inventario_estoki_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ciclosFiltrados = useMemo(
    () =>
      ciclos.filter((ciclo) => {
        const matchSearch =
          ciclo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ciclo.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "todos" || ciclo.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [ciclos, searchTerm, statusFilter]
  );

  const stats = useMemo(() => {
    const agendados = ciclos.filter((c) => c.status === "agendado").length;
    const emAndamento = ciclos.filter((c) => c.status === "em_andamento").length;
    const concluidos = ciclos.filter((c) => c.status === "concluido").length;
    const concludedCiclos = ciclos.filter((c) => c.acuracidade !== null);
    const acuracidadeMedia =
      concludedCiclos.length > 0
        ? concludedCiclos.reduce((acc, c) => acc + (c.acuracidade || 0), 0) / concludedCiclos.length
        : 0;
    return { agendados, emAndamento, concluidos, acuracidadeMedia };
  }, [ciclos]);

  const handleIniciarCiclo = async (id: string) => {
    const success = await iniciarCiclo(id);
    if (success)
      toast({ title: "Inventário Iniciado", description: "O ciclo de inventário foi iniciado" });
  };

  const handlePausarCiclo = async (id: string) => {
    const success = await pausarCiclo(id);
    if (success) toast({ title: "Inventário Pausado", description: "O ciclo foi pausado" });
  };

  if (loading) {
    return (
      <>
        <SEO title="Inventário Cíclico" path="/inventario" description="Contagens cíclicas por ABC/localização com divergências e ajustes." />
        <AppLayout title="Inventário Cíclico" showBack>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
      </>
    );
  }

  return (
    <AppLayout title="Inventário Cíclico" showBack>
      <PageTransition>
        <div className="space-y-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Controle de Inventário</h2>
              <p className="text-sm text-muted-foreground">Gerencie ciclos de contagem</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button onClick={() => setShowNewCicloDialog(true)} className="gap-2" size="sm">
                <Plus className="h-4 w-4" /> Novo Ciclo
              </Button>
            </div>
          </div>

          <SelectionToolbar
            selectedCount={selectedIds.length}
            onClear={clearSelection}
            onDelete={() =>
              toast({
                title: "Ação não permitida",
                description: "Use a exclusão individual por enquanto.",
              })
            }
          />

          <InventoryStats
            agendados={stats.agendados}
            emAndamento={stats.emAndamento}
            concluidos={stats.concluidos}
            acuracidadeMedia={stats.acuracidadeMedia}
          />

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ciclos">Ciclos</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="ciclos" className="space-y-4">
              <InventoryFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />

              <div className="space-y-3">
                {ciclosFiltrados.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <ClipboardList className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Nenhum ciclo encontrado</p>
                  </div>
                ) : (
                  ciclosFiltrados.map((ciclo) => (
                    <div key={ciclo.id} className="group relative">
                      <div
                        className={cn(
                          "absolute left-4 top-1/2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100",
                          selectedIds.includes(ciclo.id) && "opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(ciclo.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(ciclo.id)}
                          readOnly
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <div className={cn(selectedIds.includes(ciclo.id) && "pl-8")}>
                        <CicloCard
                          ciclo={ciclo}
                          onIniciar={handleIniciarCiclo}
                          onPausar={handlePausarCiclo}
                          onContinuar={(id) => navigate(`/inventario/${id}`)}
                          onVerDetalhes={(id) => navigate(`/inventario/${id}`)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              <InventarioDashboardTab ciclos={ciclos} />
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <InventarioConfigTab />
            </TabsContent>
          </Tabs>
        </div>

        <NovoCicloDialog
          open={showNewCicloDialog}
          onOpenChange={setShowNewCicloDialog}
          criarCiclo={criarCiclo}
        />
      </PageTransition>
    </AppLayout>
  );
}

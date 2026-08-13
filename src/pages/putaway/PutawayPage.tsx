import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownToLine,
  Package,
  MapPin,
  CheckCircle2,
  Scan,
  Clock,
  Play,
  ArrowLeft,
  Search,
  Box,
} from "lucide-react";
import { usePutaway, PutawayTask } from "@/hooks/usePutaway";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function PutawayPage() {
  const { tasks, isLoading, startTask, finishTask } = usePutaway();
  const [activeTask, setActiveTask] = useState<PutawayTask | null>(null);
  const [scannedLocation, setScannedLocation] = useState("");
  const [confirmQty, setConfirmQty] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = tasks.filter(
    (t) =>
      t.status !== "concluido" &&
      (t.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.posicao_destino_codigo?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartTask = (task: PutawayTask) => {
    startTask(task.id);
    setActiveTask(task);
  };

  const handleConfirm = () => {
    if (!activeTask) return;

    // Simulação de validação de local
    if (scannedLocation !== activeTask.posicao_destino_codigo && scannedLocation !== "LOC-OK") {
      toast.warning("Local escaneado diferente do sugerido. Verifique!");
    }

    const qty = Number(confirmQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    finishTask(activeTask.id, qty);
    setActiveTask(null);
    setScannedLocation("");
    setConfirmQty("");
    toast.success("Armazenamento concluído!");
  };

  if (activeTask) {
    return (
      <AppLayout title="Executando Putaway" showBack>
        <PageTransition>
          <div className="space-y-6 p-4 pb-24">
            <Button variant="ghost" onClick={() => setActiveTask(null)} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>

            <Card className="border-success bg-success/5">
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">
                  ARMAZENAMENTO ATIVO
                </Badge>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5 text-success" />
                  {activeTask.produto_nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Origem</p>
                    <p className="font-mono text-lg font-bold">
                      {activeTask.posicao_origem_codigo || "Recebimento"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-success/20 bg-success/10 p-3">
                    <p className="text-[10px] font-bold uppercase text-success">Destino Sugerido</p>
                    <p className="font-mono text-lg font-bold text-success">
                      {activeTask.posicao_destino_codigo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <Box className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Quantidade</p>
                      <p className="text-2xl font-bold">{activeTask.quantidade}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirmar Local (Scan)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escaneie o código da posição"
                        value={scannedLocation}
                        onChange={(e) => setScannedLocation(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setScannedLocation("LOC-OK")}
                      >
                        <Scan className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantidade Armazenada</label>
                    <Input
                      type="number"
                      placeholder="Confirmar quantidade"
                      value={confirmQty}
                      onChange={(e) =>
                        setConfirmQty(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
              <Button
                className="h-12 w-full bg-success text-lg hover:bg-success/90"
                onClick={handleConfirm}
                disabled={!confirmQty || !scannedLocation}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Finalizar Armazenamento
              </Button>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Lista de Putaway" showBack>
      <PageTransition>
        <div className="space-y-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto ou destino..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="overflow-hidden border-l-4 border-l-success">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold">{task.produto_nome}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            QTD: {task.quantidade}
                          </Badge>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" /> Criada {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-[80px] rounded-lg bg-success/10 p-2 text-center">
                        <p className="text-[8px] font-bold uppercase text-success">Destino</p>
                        <p className="font-mono text-sm font-bold text-success">
                          {task.posicao_destino_codigo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed pt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        Zona: {task.zona || "A"}
                      </div>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleStartTask(task)}
                      >
                        Iniciar <Play className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTasks.length === 0 && (
                <div className="py-20 text-center opacity-50">
                  <ArrowDownToLine className="mx-auto mb-4 h-16 w-16" />
                  <p>Nenhuma tarefa de armazenamento pendente.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}

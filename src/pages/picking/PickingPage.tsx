import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ListChecks, 
  Package, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Scan, 
  Clock, 
  Play, 
  ChevronRight,
  Search,
  ArrowLeft
} from "lucide-react";
import { usePicking, PickingTask } from "@/hooks/usePicking";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function PickingPage() {
  const { tasks, isLoading, startTask, finishTask } = usePicking();
  const [activeTask, setActiveTask] = useState<PickingTask | null>(null);
  const [scannedCode, setScannedCode] = useState("");
  const [confirmQty, setConfirmQty] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = tasks.filter(t => 
    t.status !== "concluido" && 
    (t.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.posicao_origem_codigo?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartTask = (task: PickingTask) => {
    startTask(task.id);
    setActiveTask(task);
  };

  const handleConfirm = () => {
    if (!activeTask) return;
    if (scannedCode !== activeTask.produto_id && scannedCode !== "CONFIRM") {
       // Em um cenário real, validaríamos o código de barras do produto
       // Aqui vamos permitir qualquer código se o usuário clicar no botão de "Simular Scan"
    }

    const qty = Number(confirmQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    finishTask(activeTask.id, qty);
    setActiveTask(null);
    setScannedCode("");
    setConfirmQty("");
  };

  if (activeTask) {
    return (
      <AppLayout title="Executando Picking" showBack>
        <PageTransition>
          <div className="p-4 space-y-6 pb-24">
            <Button variant="ghost" onClick={() => setActiveTask(null)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para lista
            </Button>

            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">TAREFA EM ANDAMENTO</Badge>
                    <CardTitle className="text-xl">{activeTask.produto_nome}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Posição</p>
                    <p className="text-lg font-mono font-bold">{activeTask.posicao_origem_codigo}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg"><Package className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium">Quantidade Solicitada</p>
                    <p className="text-2xl font-bold">{activeTask.quantidade} unidades</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Validar Produto (Scan)</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Escaneie o código do produto" 
                        value={scannedCode}
                        onChange={(e) => setScannedCode(e.target.value)}
                      />
                      <Button variant="outline" size="icon" onClick={() => setScannedCode("PROD-SCAN-OK")}>
                        <Scan className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantidade Coletada</label>
                    <Input 
                      type="number" 
                      placeholder="Informe a quantidade"
                      value={confirmQty}
                      onChange={(e) => setConfirmQty(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleConfirm}
                disabled={!confirmQty || !scannedCode}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" /> Confirmar Coleta
              </Button>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Lista de Picking" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por produto ou posição..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <Badge variant="secondary" className="px-3 py-1">{filteredTasks.length} Tarefas Pendentes</Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={
                            task.prioridade === 'critica' ? 'bg-destructive' :
                            task.prioridade === 'alta' ? 'bg-orange-500' : 'bg-primary'
                          }>
                            {task.prioridade.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pendente
                          </span>
                        </div>
                        <h3 className="text-lg font-bold">{task.produto_nome}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Posição</p>
                        <p className="text-md font-mono font-bold text-primary">{task.posicao_origem_codigo}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Quantidade</p>
                          <p className="text-xl font-bold">{task.quantidade}</p>
                        </div>
                        <div className="h-8 w-[1px] bg-border" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Zona</p>
                          <p className="text-sm font-medium">{task.zona || "Geral"}</p>
                        </div>
                      </div>
                      
                      <Button size="sm" onClick={() => handleStartTask(task)}>
                        Iniciar <Play className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTasks.length === 0 && (
                <div className="py-20 text-center">
                  <ListChecks className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-lg font-medium text-muted-foreground">Tudo limpo por aqui!</p>
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa de picking pendente.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}

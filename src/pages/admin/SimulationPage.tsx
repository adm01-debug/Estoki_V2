import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Play, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SimulationPage() {
  const [count, setCount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    setReport(null);
    try {
      const { data, error } = await supabase.functions.invoke('simulation-test', {
        method: 'GET',
        headers: { 'X-Simulation-Count': count.toString() }
      });

      if (error) throw error;
      setReport(data.report);
      toast.success("Simulação concluída com sucesso!");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao executar simulação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBack>
      <BasePageTemplate 
        title="Simulador de Stress" 
        description="Execute milhares de cenários de webhooks e edge functions para validar a resiliência do sistema."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Configuração
              </CardTitle>
              <CardDescription>Defina a carga de teste para a simulação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Quantidade de Eventos</Label>
                <Input 
                  id="count" 
                  type="number" 
                  value={count} 
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  min={1}
                  max={5000}
                />
                <p className="text-[10px] text-muted-foreground">Recomendado para stress-test: {'>'} 500 eventos.</p>
              </div>
              <Button 
                className="w-full gap-2" 
                onClick={runSimulation} 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Iniciar Simulação
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Relatório de Execução</CardTitle>
              <CardDescription>Resultados em tempo real dos cenários processados.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-12 space-y-4"
                  >
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-sm font-medium animate-pulse">Processando cenários...</p>
                  </motion.div>
                ) : report ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex flex-col items-center">
                        <span className="text-2xl font-bold text-success">{report.success}</span>
                        <span className="text-[10px] uppercase font-bold text-success/70">Sucessos</span>
                      </div>
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col items-center">
                        <span className="text-2xl font-bold text-destructive">{report.failure}</span>
                        <span className="text-[10px] uppercase font-bold text-destructive/70">Falhas</span>
                      </div>
                    </div>

                    {report.errors?.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Detalhes das Falhas
                        </Label>
                        <ScrollArea className="h-[200px] rounded-lg border bg-muted/30 p-4">
                          {report.errors.map((err: any, idx: number) => (
                            <div key={idx} className="mb-4 last:mb-0 text-[11px] font-mono border-b pb-2 last:border-0 border-border/50">
                              <p className="text-destructive font-bold mb-1">Cenário {err.i}: {err.scenario.event}</p>
                              <p className="text-muted-foreground">{err.error}</p>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <Badge variant={report.failure === 0 ? "outline" : "destructive"} className={cn("gap-1 px-4 py-1", report.failure === 0 && "bg-success/10 text-success border-success/20")}>
                        {report.failure === 0 ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {report.failure === 0 ? "Sistema Resiliente (10/10)" : "Gaps Identificados"}
                      </Badge>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Zap className="h-12 w-12 opacity-10 mb-4" />
                    <p className="text-sm">Aguardando início do teste...</p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </BasePageTemplate>
    </AppLayout>
  );
}

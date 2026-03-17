// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, Play, Pause, CheckCircle2, XCircle, Clock, 
  AlertTriangle, Shield, Loader2, RefreshCw, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui/page-header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Workflow {
  id: string;
  nome: string;
  descricao: string;
  tipo: "auto_block_vencido" | "alerta_estoque_baixo" | "aprovacao_movimentacao" | "resumo_diario";
  ativo: boolean;
  ultimaExecucao: string | null;
  config: Record<string, any>;
}

const defaultWorkflows: Workflow[] = [
  {
    id: "auto-block-vencido",
    nome: "Auto-Bloqueio de Lotes Vencidos",
    descricao: "Bloqueia automaticamente lotes com data de validade expirada e gera alerta",
    tipo: "auto_block_vencido",
    ativo: true,
    ultimaExecucao: null,
    config: { dias_antecedencia: 0 },
  },
  {
    id: "alerta-estoque-baixo",
    nome: "Alerta de Estoque Baixo",
    descricao: "Notifica quando produto atinge o ponto de pedido",
    tipo: "alerta_estoque_baixo",
    ativo: true,
    ultimaExecucao: null,
    config: { incluir_email: false },
  },
  {
    id: "aprovacao-movimentacao",
    nome: "Aprovação de Movimentações Críticas",
    descricao: "Requer aprovação de supervisor para movimentações acima de limite",
    tipo: "aprovacao_movimentacao",
    ativo: false,
    ultimaExecucao: null,
    config: { limite_quantidade: 100 },
  },
  {
    id: "resumo-diario",
    nome: "Resumo Diário por Email",
    descricao: "Envia resumo das operações do dia para gestores",
    tipo: "resumo_diario",
    ativo: false,
    ultimaExecucao: null,
    config: { horario: "18:00" },
  },
];

export default function Automacoes() {
  const { role, user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);
  const [executing, setExecuting] = useState<string | null>(null);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, ativo: !w.ativo } : w
    ));
    const wf = workflows.find(w => w.id === id);
    toast.success(`${wf?.nome} ${wf?.ativo ? "desativado" : "ativado"}`);
  };

  const executeWorkflow = async (id: string) => {
    const wf = workflows.find(w => w.id === id);
    if (!wf) return;

    setExecuting(id);
    
    try {
      switch (wf.tipo) {
        case "auto_block_vencido": {
          // Find expired lots and update status
          const { data: lotesVencidos, error } = await supabase
            .from("lotes")
            .select("id, numero_lote, data_validade, produto_id")
            .lt("data_validade", new Date().toISOString())
            .neq("status", "quarentena");

          if (error) throw error;

          let blocked = 0;
          for (const lote of lotesVencidos || []) {
            const { error: updateError } = await supabase
              .from("lotes")
              .update({ status: "quarentena" })
              .eq("id", lote.id);
            
            if (!updateError) {
              blocked++;
              // Create notification
              await supabase.from("notificacoes").insert({
                tipo: "lote_vencido",
                titulo: "⚠️ Lote Vencido Bloqueado",
                mensagem: `Lote ${lote.numero_lote} foi bloqueado automaticamente por estar vencido.`,
                referencia_tipo: "lote",
                referencia_id: lote.id,
              });
            }
          }

          toast.success(`${blocked} lotes vencidos bloqueados automaticamente`);
          break;
        }

        case "alerta_estoque_baixo": {
          // Check products below reorder point
          const { data: produtos } = await supabase
            .from("produtos")
            .select("id, sku, nome, ponto_pedido, estoque_minimo");

          const { data: estoque } = await supabase
            .from("estoque_posicao")
            .select("produto_id, quantidade");

          const estoqueMap: Record<string, number> = {};
          estoque?.forEach(e => {
            estoqueMap[e.produto_id] = (estoqueMap[e.produto_id] || 0) + e.quantidade;
          });

          let alertas = 0;
          for (const p of produtos || []) {
            const qtdAtual = estoqueMap[p.id] || 0;
            if (p.ponto_pedido && qtdAtual <= p.ponto_pedido) {
              await supabase.from("notificacoes").insert({
                tipo: "estoque_baixo",
                titulo: "📦 Estoque Baixo",
                mensagem: `${p.nome} (${p.sku}) está com ${qtdAtual} un. Ponto de pedido: ${p.ponto_pedido} un.`,
                referencia_tipo: "produto",
                referencia_id: p.id,
              });
              alertas++;
            }
          }

          toast.success(`${alertas} alertas de estoque baixo gerados`);
          break;
        }

        default:
          toast.info("Workflow configurado. Será executado conforme programado.");
      }

      setWorkflows(prev => prev.map(w => 
        w.id === id ? { ...w, ultimaExecucao: new Date().toISOString() } : w
      ));
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setExecuting(null);
    }
  };

  const getStatusIcon = (wf: Workflow) => {
    if (executing === wf.id) return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    if (wf.ativo) return <CheckCircle2 className="h-4 w-4 text-success" />;
    return <Pause className="h-4 w-4 text-muted-foreground" />;
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "auto_block_vencido": return AlertTriangle;
      case "alerta_estoque_baixo": return Zap;
      case "aprovacao_movimentacao": return Shield;
      case "resumo_diario": return Clock;
      default: return Settings;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <PageHeader 
        title="Automações & Workflows" 
        description="Configure regras automáticas para seu armazém"
      />

      <div className="space-y-4">
        {workflows.map((wf, index) => {
          const TypeIcon = getTypeIcon(wf.tipo);
          return (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-border/30">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      wf.ativo ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <TypeIcon className={`h-6 w-6 ${wf.ativo ? "text-primary" : "text-muted-foreground"}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{wf.nome}</h3>
                        {getStatusIcon(wf)}
                        <Badge variant="outline" className={wf.ativo 
                          ? "bg-success/10 text-success border-success/30" 
                          : "bg-muted text-muted-foreground"
                        }>
                          {wf.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{wf.descricao}</p>
                      
                      {wf.ultimaExecucao && (
                        <p className="text-xs text-muted-foreground/60">
                          Última execução: {new Date(wf.ultimaExecucao).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeWorkflow(wf.id)}
                        disabled={executing === wf.id}
                        className="gap-1"
                      >
                        {executing === wf.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        Executar
                      </Button>
                      <Switch 
                        checked={wf.ativo} 
                        onCheckedChange={() => toggleWorkflow(wf.id)} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

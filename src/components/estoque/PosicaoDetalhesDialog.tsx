import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Package, Clock, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import type { PosicaoEstoque, StatusPosicao } from "@/hooks/useEstoque";
import { PosicaoProdutoCard } from "./PosicaoProdutoCard";
import { PosicaoLoteCard } from "./PosicaoLoteCard";

const statusConfig: Record<StatusPosicao, { color: string; bg: string; border: string; label: string; icon: string }> = {
  livre: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-dashed border-border", label: "Livre", icon: "⬜" },
  ocupado: { color: "text-success", bg: "bg-success/20", border: "border-success", label: "Ocupado", icon: "🟢" },
  reservado: { color: "text-warning", bg: "bg-warning/20", border: "border-warning", label: "Reservado", icon: "🟡" },
  bloqueado: { color: "text-destructive", bg: "bg-destructive/20", border: "border-destructive", label: "Bloqueado", icon: "🔴" },
};

interface ProdutoDetalhes {
  id: string; sku: string; nome: string; descricao?: string; unidade?: string;
  curva_abc?: string; peso_unitario?: number; fornecedor_principal?: string;
}

interface LoteDetalhes {
  id: string; numero_lote: string; quantidade_inicial: number; quantidade_atual: number;
  data_recebimento: string; data_validade?: string; data_fabricacao?: string;
  fornecedor?: string; nf_entrada?: string; pedido_compra?: string; status: string;
}

interface EstoquePosicaoDetalhes {
  id: string; quantidade: number; data_entrada: string;
  produto: ProdutoDetalhes; lote?: LoteDetalhes;
}

interface PosicaoDetalhesDialogProps {
  position: PosicaoEstoque | null;
  onClose: () => void;
}

export function PosicaoDetalhesDialog({ position, onClose }: PosicaoDetalhesDialogProps) {
  const [detalhes, setDetalhes] = useState<EstoquePosicaoDetalhes | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDetalhes() {
      if (!position || position.status !== 'ocupado') { setDetalhes(null); return; }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('estoque_posicao')
          .select(`id, quantidade, data_entrada, produtos (id, sku, nome, descricao, unidade, curva_abc, peso_unitario, fornecedor_principal), lotes (id, numero_lote, quantidade_inicial, quantidade_atual, data_recebimento, data_validade, data_fabricacao, fornecedor, nf_entrada, pedido_compra, status)`)
          .eq('posicao_id', position.id).single();
        if (error) throw error;
        if (data) {
          setDetalhes({
            id: data.id, quantidade: data.quantidade, data_entrada: data.data_entrada,
            produto: data.produtos as unknown as ProdutoDetalhes,
            lote: data.lotes as unknown as LoteDetalhes | undefined,
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Erro ao buscar detalhes:', err);
        setDetalhes(null);
      } finally { setLoading(false); }
    }
    fetchDetalhes();
  }, [position]);

  if (!position) return null;

  const diasArmazenado = detalhes?.data_entrada ? differenceInDays(new Date(), new Date(detalhes.data_entrada)) : 0;
  const diasParaVencer = detalhes?.lote?.data_validade ? differenceInDays(new Date(detalhes.lote.data_validade), new Date()) : null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="bg-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{position.codigo}</h3>
                <Badge className={cn("mt-1", statusConfig[position.status].bg, statusConfig[position.status].color)}>
                  {statusConfig[position.status].icon} {statusConfig[position.status].label}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>

          <div className="p-4 space-y-4">
            {/* Posição Info */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                  <Layers className="h-4 w-4" />Informações da Posição
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Tipo</span><p className="font-medium capitalize">{position.tipo.replace('_', ' ')}</p></div>
                  {position.porta_palete && <div><span className="text-muted-foreground">Porta-Palete</span><p className="font-medium">{position.porta_palete}</p></div>}
                  {position.nivel && <div><span className="text-muted-foreground">Nível</span><p className="font-medium">N{position.nivel}</p></div>}
                  {position.secao && <div><span className="text-muted-foreground">Seção</span><p className="font-medium">{position.secao}</p></div>}
                  {position.zona && <div><span className="text-muted-foreground">Zona</span><p className="font-medium">{position.zona}</p></div>}
                  {position.capacidade_kg && <div><span className="text-muted-foreground">Capacidade</span><p className="font-medium">{position.capacidade_kg} kg</p></div>}
                </div>
              </CardContent>
            </Card>

            {loading && <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}

            {!loading && detalhes?.produto && (
              <PosicaoProdutoCard produto={detalhes.produto} quantidade={detalhes.quantidade} diasArmazenado={diasArmazenado} />
            )}

            {!loading && detalhes?.lote && (
              <PosicaoLoteCard lote={detalhes.lote} diasParaVencer={diasParaVencer} />
            )}

            {position.status === 'livre' && (
              <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Posição disponível para armazenamento</p></div>
            )}
            {position.status === 'reservado' && (
              <div className="text-center py-8 text-warning"><Clock className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Posição reservada para recebimento</p></div>
            )}
            {position.status === 'bloqueado' && (
              <div className="text-center py-8 text-destructive"><X className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Posição bloqueada para movimentação</p></div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

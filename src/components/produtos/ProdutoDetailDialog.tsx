import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  History,
  Info,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import type { ReactNode } from "react";

import type { Produto } from "@/types/product";

interface Props {
  produto: Produto | null;
  onClose: () => void;
  getCurvaBadge: (curva?: string | null) => ReactNode;
}

export function ProdutoDetailDialog({ produto, onClose, getCurvaBadge }: Props) {
  const { data: historico, isLoading: loadingHist } = useQuery({
    queryKey: ["produto-historico", produto?.id],
    queryFn: async () => {
      if (!produto?.id) return [];
      const { data, error } = await supabase
        .from("rastreamento_historico")
        .select("*")
        .eq("produto_id", produto.id)
        .order("data_evento", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!produto?.id,
  });

  return (
    <Dialog open={!!produto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{produto?.nome}</DialogTitle>
          <DialogDescription>SKU: {produto?.sku}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="detalhes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalhes" className="gap-2">
              <Info className="h-4 w-4" /> Detalhes
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="h-4 w-4" /> Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="space-y-4 py-4">
            {produto && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="text-xs text-muted-foreground">Unidade</span>
                    <p className="font-medium">{produto.unidade || "-"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="text-xs text-muted-foreground">Curva ABC</span>
                    <div className="mt-1">{getCurvaBadge(produto.curva_abc)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="text-xs text-muted-foreground">Estoque Mín/Máx</span>
                    <p className="font-medium">
                      {produto.estoque_minimo ?? "0"} / {produto.estoque_maximo ?? "∞"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="text-xs text-muted-foreground">Ponto de Pedido</span>
                    <p className="font-medium">{produto.ponto_pedido ?? "-"}</p>
                  </div>
                </div>

                {produto.descricao && (
                  <div className="border-t pt-2">
                    <span className="text-sm text-muted-foreground">Descrição</span>
                    <p className="mt-1 text-sm leading-relaxed">{produto.descricao}</p>
                  </div>
                )}

                {produto.fornecedor_principal && (
                  <div className="border-t pt-2">
                    <span className="text-sm text-muted-foreground">Fornecedor Principal</span>
                    <p className="mt-1 text-sm font-medium">{produto.fornecedor_principal}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="py-4">
            <ScrollArea className="h-[300px] pr-4">
              {loadingHist ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : historico && historico.length > 0 ? (
                <div className="space-y-4">
                  {historico.map((event) => (
                    <div key={event.id} className="relative border-l pb-4 pl-6 last:pb-0">
                      <div className="absolute left-[-9px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background">
                        {["recebimento_nf", "devolucao", "armazenamento"].includes(
                          event.tipo_evento
                        ) ? (
                          <ArrowDownLeft className="h-2 w-2 text-success" />
                        ) : ["saida_transporte", "entrega", "separacao", "carregamento"].includes(
                            event.tipo_evento
                          ) ? (
                          <ArrowUpRight className="h-2 w-2 text-destructive" />
                        ) : (
                          <RefreshCcw className="h-2 w-2 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-semibold">{event.descricao}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(event.data_evento), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Qtd: {event.quantidade || 0} | Local: {event.localizacao || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <Package className="mb-2 h-8 w-8 opacity-20" />
                  <p className="text-sm">Nenhum evento registrado</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

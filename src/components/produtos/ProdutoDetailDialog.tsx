 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { format } from "date-fns";
 import { ptBR } from "date-fns/locale";
 import { History, Info, Package, ArrowUpRight, ArrowDownLeft, RefreshCcw, Loader2 } from "lucide-react";
 import type { ReactNode } from "react";

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  descricao?: string;
  unidade?: string;
  curva_abc?: string;
  estoque_minimo?: number;
  estoque_maximo?: number;
  ponto_pedido?: number;
  peso_unitario?: number;
  fornecedor_principal?: string;
  giro_mensal?: number;
  created_at: string;
}

interface Props {
  produto: Produto | null;
  onClose: () => void;
  getCurvaBadge: (curva?: string) => ReactNode;
}

export function ProdutoDetailDialog({ produto, onClose, getCurvaBadge }: Props) {
   const { data: historico, isLoading: loadingHist } = useQuery({
     queryKey: ['produto-historico', produto?.id],
     queryFn: async () => {
       if (!produto?.id) return [];
       const { data, error } = await supabase
         .from('rastreamento_historico')
         .select('*')
         .eq('produto_id', produto.id)
         .order('data_evento', { ascending: false });
       if (error) throw error;
       return data;
     },
     enabled: !!produto?.id
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
            <TabsTrigger value="detalhes" className="gap-2"><Info className="h-4 w-4" /> Detalhes</TabsTrigger>
            <TabsTrigger value="historico" className="gap-2"><History className="h-4 w-4" /> Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detalhes" className="space-y-4 py-4">
            {produto && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <span className="text-muted-foreground text-xs">Unidade</span>
                    <p className="font-medium">{produto.unidade || "-"}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <span className="text-muted-foreground text-xs">Curva ABC</span>
                    <div className="mt-1">{getCurvaBadge(produto.curva_abc)}</div>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <span className="text-muted-foreground text-xs">Estoque Mín/Máx</span>
                    <p className="font-medium">{produto.estoque_minimo ?? "0"} / {produto.estoque_maximo ?? "∞"}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <span className="text-muted-foreground text-xs">Ponto de Pedido</span>
                    <p className="font-medium">{produto.ponto_pedido ?? "-"}</p>
                  </div>
                </div>
                
                {produto.descricao && (
                  <div className="border-t pt-2">
                    <span className="text-sm text-muted-foreground">Descrição</span>
                    <p className="text-sm mt-1 leading-relaxed">{produto.descricao}</p>
                  </div>
                )}
                
                {produto.fornecedor_principal && (
                  <div className="border-t pt-2">
                    <span className="text-sm text-muted-foreground">Fornecedor Principal</span>
                    <p className="text-sm font-medium mt-1">{produto.fornecedor_principal}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="historico" className="py-4">
            <ScrollArea className="h-[300px] pr-4">
              {loadingHist ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : historico && historico.length > 0 ? (
                <div className="space-y-4">
                  {historico.map((event) => (
                    <div key={event.id} className="relative pl-6 border-l pb-4 last:pb-0">
                      <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        {['recebimento_nf', 'devolucao', 'armazenamento'].includes(event.tipo_evento) ? <ArrowDownLeft className="h-2 w-2 text-success" /> : 
                         ['saida_transporte', 'entrega', 'separacao', 'carregamento'].includes(event.tipo_evento) ? <ArrowUpRight className="h-2 w-2 text-destructive" /> : 
                         <RefreshCcw className="h-2 w-2 text-primary" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
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
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-20" />
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

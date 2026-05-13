import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { 
   History, 
   ArrowUpRight, 
   ArrowDownLeft, 
   RefreshCw, 
   Search,
   Calendar,
   User,
   Filter,
   Download,
   LayoutGrid,
   List,
   ArrowRight,
   Clock
} from "lucide-react";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StockMovementsPage() {
  const { movimentacoes, loading } = useMovimentacoes();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovements = movimentacoes.filter(mov => 
    mov.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.lote_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMovementIcon = (tipo: string) => {
    if (tipo.includes('entrada') || tipo.includes('recebimento')) 
      return <ArrowDownLeft className="h-4 w-4 text-success" />;
    if (tipo.includes('saida') || tipo.includes('separacao')) 
      return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    return <RefreshCw className="h-4 w-4 text-primary" />;
  };

   return (
     <AppLayout title="Histórico Operacional" showBack>
       <PageTransition>
         <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="space-y-1">
               <h1 className="text-2xl font-black tracking-tight text-foreground">Fluxo de Movimentações</h1>
               <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                 <Clock className="h-3.5 w-3.5" />
                 Log de auditoria completo e imutável
               </div>
             </div>
             
             <div className="flex flex-wrap items-center gap-2">
               <div className="relative w-full md:w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                 <Input 
                   placeholder="SKU, Lote ou Descrição..." 
                   className="pl-10 h-10 rounded-xl bg-muted/30 border-border/40 focus:bg-background transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/40">
                 <Filter className="h-4 w-4" />
               </Button>
               <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/40">
                 <Download className="h-4 w-4" />
               </Button>
             </div>
           </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Linha do Tempo
              </CardTitle>
              <Badge variant="outline">{filteredMovements.length} registros</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : filteredMovements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma movimentação encontrada com os filtros atuais.
                </div>
              ) : (
                <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {filteredMovements.map((mov) => (
                    <div key={mov.id} className="relative flex items-center justify-between gap-4 p-4 pl-12 border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-background border shadow-sm ml-0">
                        {getMovementIcon(mov.tipo)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{mov.descricao}</span>
                          <Badge variant="secondary" className="text-[10px] uppercase">{mov.tipo.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mov.produto_nome || "Produto desconhecido"}
                          {mov.lote_numero && <span className="mx-1">• Lote: {mov.lote_numero}</span>}
                          {mov.localizacao && <span className="mx-1">• Local: {mov.localizacao}</span>}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {mov.operador_nome || "Sistema"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-lg font-bold">{mov.quantidade}</span>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
}

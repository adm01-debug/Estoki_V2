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
 import { motion, AnimatePresence } from "framer-motion";
 import { cn } from "@/lib/utils";

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

           <Card className="glass-card border-border/30 overflow-hidden">
             <CardHeader className="border-b border-border/20 px-8 py-6 flex flex-row items-center justify-between bg-muted/20">
               <div className="space-y-1">
                 <CardTitle className="text-lg font-black tracking-tight">Linha do Tempo</CardTitle>
                 <CardDescription className="text-xs font-medium">Fluxo cronológico de entradas, saídas e transferências</CardDescription>
               </div>
               <div className="flex items-center gap-3">
                 <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/40">
                   <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-background shadow-sm text-primary">
                     <List className="h-4 w-4" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-muted-foreground">
                     <LayoutGrid className="h-4 w-4" />
                   </Button>
                 </div>
                 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 rounded-full uppercase tracking-widest text-[10px]">
                   {filteredMovements.length} Registros
                 </Badge>
               </div>
             </CardHeader>
             <CardContent className="p-8">
               {loading ? (
                 <div className="space-y-4">
                   {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                 </div>
               ) : filteredMovements.length === 0 ? (
                 <div className="text-center py-20">
                   <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                     <History className="h-8 w-8 text-muted-foreground/40" />
                   </div>
                   <p className="text-sm font-bold text-muted-foreground">Nenhum registro encontrado</p>
                   <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar seus filtros ou termos de busca.</p>
                 </div>
               ) : (
                 <div className="relative space-y-4 before:absolute before:inset-0 before:ml-[1.375rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border/10 before:via-border/60 before:to-border/10">
                   <AnimatePresence mode="popLayout">
                     {filteredMovements.map((mov, idx) => (
                       <motion.div 
                         key={mov.id} 
                         layout
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ duration: 0.3, delay: idx * 0.03 }}
                         className="relative flex items-center justify-between gap-6 p-5 pl-14 rounded-2xl border border-border/30 bg-card/50 hover:bg-muted/20 transition-all duration-300 hover:shadow-lg group/item"
                       >
                         <div className={cn(
                           "absolute left-0 w-11 h-11 flex items-center justify-center rounded-2xl border shadow-sm ml-0 transition-transform group-hover/item:scale-110 group-hover/item:rotate-6",
                           mov.tipo.includes('entrada') ? "bg-success/5 border-success/20" : 
                           mov.tipo.includes('saida') ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/20"
                         )}>
                           {getMovementIcon(mov.tipo)}
                         </div>
                         
                         <div className="flex-1 space-y-1.5 min-w-0">
                           <div className="flex items-center gap-3">
                             <span className="font-black text-sm text-foreground tracking-tight truncate">{mov.descricao}</span>
                             <Badge variant="outline" className={cn(
                               "text-[9px] font-black uppercase tracking-widest px-2 py-0 rounded-full",
                               mov.tipo.includes('entrada') ? "text-success border-success/30 bg-success/5" : 
                               mov.tipo.includes('saida') ? "text-destructive border-destructive/30 bg-destructive/5" : "text-primary border-primary/30 bg-primary/5"
                             )}>
                               {mov.tipo.replace(/_/g, ' ')}
                             </Badge>
                           </div>
                           <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground/80">
                             <span className="truncate">{mov.produto_nome || "Produto desconhecido"}</span>
                             {mov.lote_numero && <><div className="w-1 h-1 rounded-full bg-border" /><span>Lote: <span className="text-foreground font-bold">{mov.lote_numero}</span></span></>}
                             {mov.localizacao && <><div className="w-1 h-1 rounded-full bg-border" /><span>Posição: <span className="text-foreground font-bold">{mov.localizacao}</span></span></>}
                           </div>
                           <div className="flex items-center gap-4 pt-1">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                               <Calendar className="h-3 w-3" />
                               {format(new Date(mov.created_at), "dd MMM yyyy • HH:mm", { locale: ptBR })}
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                               <User className="h-3 w-3" />
                               {mov.operador_nome || "Sistema Automatizado"}
                             </div>
                           </div>
                         </div>
                         
                         <div className="text-right shrink-0">
                           <p className={cn(
                             "text-2xl font-black tracking-tighter leading-none",
                             mov.tipo.includes('entrada') ? "text-success" : mov.tipo.includes('saida') ? "text-destructive" : "text-primary"
                           )}>
                             {mov.tipo.includes('saida') ? '-' : '+'}{mov.quantidade}
                           </p>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">unidades</p>
                         </div>
                         
                         <div className="shrink-0 pl-4 border-l border-border/20">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity">
                             <ArrowRight className="h-4 w-4" />
                           </Button>
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
               )}
             </CardContent>
           </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
}

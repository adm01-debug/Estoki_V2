import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { cn } from "@/lib/utils";
import { useInventoryCount } from "@/hooks/useInventoryCount";
import { 
  ClipboardList, 
  Plus, 
   History, 
   TrendingUp, 
   Package, 
   AlertTriangle,
   ArrowRight,
   Search,
   Filter,
   Download,
   Zap,
   Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export default function InventoryPage() {
  const navigate = useNavigate();
  const { items, getAccuracy, getTotalVariance } = useInventoryCount();
  const accuracy = getAccuracy();
  const variance = getTotalVariance();

   return (
     <AppLayout title="Centro de Inventário" showBack>
       <PageTransition>
         <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="space-y-1">
               <h1 className="text-2xl font-black tracking-tight text-foreground">Controle de Inventário</h1>
               <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                 <Clock className="h-3.5 w-3.5" />
                 Última atualização: {new Date().toLocaleTimeString()}
               </div>
             </div>
             <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/40 gap-2 font-bold text-xs uppercase tracking-wider">
                 <Download className="h-4 w-4" /> Exportar
               </Button>
               <Button size="sm" className="h-9 rounded-xl glow-button gap-2 font-bold text-xs uppercase tracking-wider">
                 <Plus className="h-4 w-4" /> Nova Contagem
               </Button>
             </div>
           </div>
 
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="glass-card border-primary/20 bg-primary/5 group hover:border-primary/40 transition-all duration-300">
               <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                     <TrendingUp className="h-5 w-5 text-primary" />
                   </div>
                   <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">Meta 99%</Badge>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acuracidade do Estoque</p>
                   <p className="text-3xl font-black tracking-tight text-primary">{accuracy.toFixed(1)}%</p>
                 </div>
                 <Progress value={accuracy} className="h-1.5 mt-4 bg-primary/10" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               </CardContent>
             </Card>
 
             <Card className="glass-card border-border/30 group hover:border-primary/30 transition-all duration-300">
               <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
                     <Package className="h-5 w-5 text-muted-foreground" />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Itens em Processo</p>
                   <p className="text-3xl font-black tracking-tight text-foreground">{items.length}</p>
                 </div>
                 <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase">Sessão de contagem ativa</p>
               </CardContent>
             </Card>
 
             <Card className={cn(
               "glass-card group transition-all duration-300",
               variance !== 0 ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50" : "border-border/30 hover:border-primary/30"
             )}>
               <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                     variance !== 0 ? "bg-destructive/10 border-destructive/20" : "bg-muted border-border/50"
                   )}>
                     <AlertTriangle className={cn("h-5 w-5", variance !== 0 ? "text-destructive" : "text-muted-foreground")} />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Divergência Acumulada</p>
                   <p className={cn("text-3xl font-black tracking-tight", variance !== 0 ? "text-destructive" : "text-foreground")}>
                     {variance > 0 ? `+${variance}` : variance}
                   </p>
                 </div>
                 <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase">Físico vs Sistêmico</p>
               </CardContent>
             </Card>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="glass-card border-border/30 group hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden" onClick={() => navigate("/inventario-ciclico")}>
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:scale-110 transition-transform duration-700">
                 <ClipboardList className="h-32 w-32 text-primary" />
               </div>
               <CardContent className="p-8">
                 <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:shadow-glow-sm transition-all duration-300">
                     <ClipboardList className="h-8 w-8 text-primary" />
                   </div>
                   <div className="flex-1 space-y-1">
                     <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">Inventário Cíclico</CardTitle>
                     <CardDescription className="text-sm font-medium">Contagens rotativas baseadas em Curva ABC ou por Zona. Ideal para manutenção diária da acuracidade.</CardDescription>
                   </div>
                   <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                     <ArrowRight className="h-5 w-5" />
                   </div>
                 </div>
               </CardContent>
             </Card>
 
             <Card className="glass-card border-border/30 group hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden" onClick={() => navigate("/inventory/movements")}>
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:scale-110 transition-transform duration-700">
                 <History className="h-32 w-32 text-primary" />
               </div>
               <CardContent className="p-8">
                 <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center border border-border/50 group-hover:shadow-glow-sm transition-all duration-300">
                     <History className="h-8 w-8 text-foreground/70" />
                   </div>
                   <div className="flex-1 space-y-1">
                     <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">Histórico de Fluxo</CardTitle>
                     <CardDescription className="text-sm font-medium">Rastreabilidade completa e auditável de todas as movimentações de estoque, entradas e saídas.</CardDescription>
                   </div>
                   <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                     <ArrowRight className="h-5 w-5" />
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Itens da Última Contagem</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nova Contagem
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma contagem ativa ou recente para exibir.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-bold">{item.sku}</p>
                        <p className="text-sm text-muted-foreground">Esperado: {item.expected} | Contado: {item.counted}</p>
                      </div>
                      <Badge variant={item.variance === 0 ? "default" : "destructive"}>
                        {item.variance === 0 ? "Sem Divergência" : `Divergência: ${item.variance}`}
                      </Badge>
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

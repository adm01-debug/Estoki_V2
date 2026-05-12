import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { KanbanBoard } from "@/components/ui/kanban/KanbanBoard";
import { orderService } from "@/services/orderService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await orderService.getAll();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Gestão de Pedidos" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Pedidos de Saída</h2>
              <p className="text-sm text-muted-foreground">Acompanhe o fluxo de vendas e expedição</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Novo Pedido
            </Button>
          </div>

          <KanbanBoard 
            columns={[
              { id: "pendente", title: "Pendente", color: "bg-slate-400" },
              { id: "em_separacao", title: "Picking", color: "bg-blue-500" },
              { id: "embalagem", title: "Embalagem", color: "bg-purple-500" },
              { id: "aguardando_transporte", title: "Expedição", color: "bg-orange-500" },
              { id: "enviado", title: "Enviado", color: "bg-success" }
            ]}
            items={orders.map(o => ({
              id: o.id,
              columnId: o.status,
              title: o.codigo,
              description: o.cliente_nome,
              priority: o.prioridade === 3 ? "critical" : o.prioridade === 2 ? "high" : "medium",
              tags: [`${o.itens?.length || 0} itens`]
            }))}
            renderItem={(item) => {
              const order = orders.find(o => o.id === item.id);
              return (
                <Card className="hover:border-primary/50 transition-all shadow-sm group">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-sm text-primary">{order.codigo}</span>
                      {order.prioridade >= 2 && <Badge variant="destructive" className="text-[9px] h-4 px-1">URGENTE</Badge>}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="line-clamp-1">{order.cliente_nome}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(order.created_at), "dd MMM HH:mm", { locale: ptBR })}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-between items-center">
                       <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">
                         {order.itens?.length || 0} Itens
                       </span>
                       <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100">
                         Gerenciar
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }}
          />
        </div>
      </PageTransition>
    </AppLayout>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInventoryCount } from "@/hooks/useInventoryCount";
import { 
  ClipboardList, 
  Plus, 
  History, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export default function InventoryPage() {
  const navigate = useNavigate();
  const { items, getAccuracy, getTotalVariance } = useInventoryCount();
  const accuracy = getAccuracy();
  const variance = getTotalVariance();

  return (
    <AppLayout title="Inventário Geral" showBack>
      <PageTransition>
        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acuracidade</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
                <Progress value={accuracy} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Itens em Contagem</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{items.length}</div>
                <p className="text-xs text-muted-foreground">Sessão atual</p>
              </CardContent>
            </Card>
            <Card className={variance !== 0 ? "border-destructive/20 bg-destructive/5" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Divergência Total</CardTitle>
                <AlertTriangle className={variance !== 0 ? "h-4 w-4 text-destructive" : "h-4 w-4 text-muted-foreground"} />
              </CardHeader>
              <CardContent>
                <div className={variance !== 0 ? "text-2xl font-bold text-destructive" : "text-2xl font-bold"}>
                  {variance > 0 ? `+${variance}` : variance}
                </div>
                <p className="text-xs text-muted-foreground">Unidades físicas vs sistêmicas</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => navigate("/inventario-ciclico")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Inventário Cíclico</CardTitle>
                    <p className="text-sm text-muted-foreground">Contagens rotativas por curva ABC ou zona</p>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => navigate("/inventory/movements")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <History className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Histórico de Movimentações</CardTitle>
                    <p className="text-sm text-muted-foreground">Rastreabilidade completa de todas as ações</p>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
                </div>
              </CardHeader>
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

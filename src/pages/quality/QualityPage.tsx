import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQualityControl } from "@/hooks/useQualityControl";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function QualityPage() {
  const { inspections, isLoading } = useQualityControl();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInspections = inspections.filter(
    (ins) =>
      ins.lote?.numero_lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.lote?.produto?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (resultado: string) => {
    switch (resultado) {
      case "aprovado":
        return (
          <Badge className="bg-success hover:bg-success/90">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Aprovado
          </Badge>
        );
      case "rejeitado":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Rejeitado
          </Badge>
        );
      case "condicional":
        return (
          <Badge
            variant="secondary"
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            <AlertCircle className="mr-1 h-3 w-3" /> Condicional
          </Badge>
        );
      default:
        return <Badge variant="outline">{resultado}</Badge>;
    }
  };

  return (
    <AppLayout title="Controle de Qualidade" showBack>
      <PageTransition>
        <div className="space-y-6 p-4 md:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por lote ou produto..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Inspeção
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inspeções</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inspections.length}</div>
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inspections.length > 0
                    ? Math.round(
                        (inspections.filter((i) => i.resultado === "aprovado").length /
                          inspections.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Geral do sistema</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejeições Críticas</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inspections.filter((i) => i.resultado === "rejeitado").length}
                </div>
                <p className="text-xs text-muted-foreground">Necessitam atenção</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Inspeções</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredInspections.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhuma inspeção encontrada.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInspections.map((ins) => (
                    <div
                      key={ins.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">
                            Lote: {ins.lote?.numero_lote || "N/A"}
                          </span>
                          {getStatusBadge(ins.resultado)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ins.lote?.produto?.nome || "Produto desconhecido"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Score: {ins.pontuacao}/100</span>
                          <span>•</span>
                          <span>
                            {format(new Date(ins.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
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

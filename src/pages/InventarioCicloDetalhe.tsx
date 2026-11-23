import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInventarioCiclico } from "@/hooks/useInventarioCiclico";
import type { Contagem, Ciclo } from "@/hooks/useInventarioCiclico/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_CONTAGEM: Record<string, { label: string; variant: BadgeVariant }> = {
  pendente: { label: "Pendente", variant: "outline" },
  em_andamento: { label: "Em andamento", variant: "secondary" },
  concluido: { label: "Concluido", variant: "default" },
  divergencia: { label: "Divergencia", variant: "destructive" },
};

export default function InventarioCicloDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ciclos, registrarContagem, getContagensCiclo, finalizarCiclo } = useInventarioCiclico();

  const [contagens, setContagens] = useState<Contagem[]>([]);
  const [loadingContagens, setLoadingContagens] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState<Record<string, boolean>>({});

  const ciclo: Ciclo | undefined = ciclos.find((c) => c.id === id);

  const fetchContagens = useCallback(async () => {
    if (!id) return;
    setLoadingContagens(true);
    try {
      const data = await getContagensCiclo(id);
      setContagens(data);
    } catch {
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar as contagens",
        variant: "destructive",
      });
    } finally {
      setLoadingContagens(false);
    }
  }, [id, getContagensCiclo, toast]);

  useEffect(() => {
    fetchContagens();
  }, [fetchContagens]);

  const handleRegistrar = async (contagem: Contagem) => {
    const qty = parseInt(quantidades[contagem.id] ?? "", 10);
    if (isNaN(qty) || qty < 0) {
      toast({
        title: "Quantidade invalida",
        description: "Informe um numero >= 0",
        variant: "destructive",
      });
      return;
    }
    setSalvando((prev) => ({ ...prev, [contagem.id]: true }));
    try {
      await registrarContagem(contagem.ciclo_id, contagem.posicao_id, qty);
      toast({ title: "Contagem registrada", description: `${qty} un. salvo.` });
      await fetchContagens();
      setQuantidades((prev) => {
        const next = { ...prev };
        delete next[contagem.id];
        return next;
      });
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSalvando((prev) => ({ ...prev, [contagem.id]: false }));
    }
  };

  const handleFinalizar = async () => {
    if (!id) return;
    setFinalizando(true);
    try {
      await finalizarCiclo(id);
      toast({ title: "Ciclo finalizado", description: "Inventario concluido com sucesso." });
      navigate("/inventario");
    } catch (err) {
      toast({
        title: "Erro ao finalizar",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setFinalizando(false);
    }
  };

  const pendentes = contagens.filter((c) => c.status === "pendente" || c.status === "em_andamento");
  const concluidas = contagens.filter(
    (c) => c.status === "concluido" || c.status === "divergencia"
  );

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inventario")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{ciclo?.nome ?? "Ciclo de Inventario"}</h1>
            {ciclo && (
              <p className="text-sm text-muted-foreground">
                {ciclo.tipo} &middot; {ciclo.posicoes_contadas}/{ciclo.total_posicoes} posicoes
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={fetchContagens}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {loadingContagens ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : contagens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <ClipboardList className="h-10 w-10" />
              <p>Nenhuma posicao atribuida a este ciclo.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {pendentes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Posicoes Pendentes ({pendentes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendentes.map((cont) => {
                    const isSaving = salvando[cont.id];
                    const statusInfo = STATUS_CONTAGEM[cont.status];
                    return (
                      <div key={cont.id} className="flex items-end gap-2 rounded-lg border p-3">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {cont.produto_nome ?? cont.produto_id ?? "Produto desconhecido"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sistema: {cont.quantidade_sistema} un.
                          </p>
                          {statusInfo && (
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          )}
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Contado</Label>
                            <Input
                              type="number"
                              min="0"
                              className="h-8 w-24"
                              placeholder="Qtd"
                              value={quantidades[cont.id] ?? ""}
                              onChange={(e) =>
                                setQuantidades((prev) => ({
                                  ...prev,
                                  [cont.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRegistrar(cont)}
                            disabled={isSaving}
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {concluidas.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Contagens Realizadas ({concluidas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {concluidas.map((cont) => (
                    <div
                      key={cont.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {cont.produto_nome ?? cont.produto_id ?? "Produto desconhecido"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sistema: {cont.quantidade_sistema} &middot; Contado:{" "}
                          {cont.quantidade_contada ?? ""}
                          {cont.status === "divergencia" && (
                            <span className="ml-2 text-destructive">
                              Delta {(cont.quantidade_contada ?? 0) - cont.quantidade_sistema}
                            </span>
                          )}
                        </p>
                      </div>
                      {cont.status === "divergencia" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {pendentes.length === 0 && ciclo?.status !== "concluido" && (
              <Button className="w-full" onClick={handleFinalizar} disabled={finalizando}>
                {finalizando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Finalizar Ciclo
              </Button>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

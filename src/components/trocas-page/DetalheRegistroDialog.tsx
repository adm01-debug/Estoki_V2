import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TrocaDevolucao, StatusRegistro } from "@/hooks/useTrocasDevolucoes";
import {
  StatusBadge,
  TipoBadge,
  statusConfig,
  statusWorkflow,
  motivoLabels,
  mapStatusToUI,
  mapUIStatusToDB,
} from "@/components/trocas";

interface DetalheRegistroDialogProps {
  registro: TrocaDevolucao | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: StatusRegistro) => void;
}

export function DetalheRegistroDialog({
  registro,
  open,
  onClose,
  onStatusChange,
}: DetalheRegistroDialogProps) {
  if (!registro) return null;

  const uiStatus = mapStatusToUI(registro.status);
  const currentIndex = statusWorkflow.indexOf(uiStatus);
  const nextUIStatus =
    currentIndex < statusWorkflow.length - 1 ? statusWorkflow[currentIndex + 1] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">#{registro.pedido}</span>
            <TipoBadge tipo={registro.tipo} />
            <StatusBadge status={uiStatus} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 text-lg font-semibold">{registro.produto}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              {registro.sku && (
                <div>
                  <p className="text-muted-foreground">SKU</p>
                  <p className="font-medium">{registro.sku}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Quantidade</p>
                <p className="font-medium text-primary">{registro.quantidade} peças</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-medium">{registro.cliente}</p>
              </div>
              {registro.fornecedor && (
                <div>
                  <p className="text-muted-foreground">Fornecedor</p>
                  <p className="font-medium">{registro.fornecedor}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium">Progresso do Workflow</h4>
            <div className="flex items-center gap-2">
              {statusWorkflow.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const config = statusConfig[step];
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div
                      className={`flex flex-1 flex-col items-center ${isCurrent ? "scale-110" : ""}`}
                    >
                      <div
                        className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {config.icon}
                      </div>
                      <span
                        className={`text-center text-xs ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    {index < statusWorkflow.length - 1 && (
                      <div className={`h-0.5 w-full ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Informações do Problema</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{motivoLabels[registro.motivo]}</span>
              </div>
              {registro.descricao_problema && (
                <p className="pl-6 text-sm text-muted-foreground">{registro.descricao_problema}</p>
              )}
            </div>
          </div>

          {registro.fotos && registro.fotos.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">Fotos</h4>
              <div className="grid grid-cols-3 gap-2">
                {registro.fotos.map((foto, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={foto}
                      alt={`Foto ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(registro.valor_unitario || registro.valor_total) && (
            <div className="grid grid-cols-2 gap-4">
              {registro.valor_unitario && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Valor Unitário</p>
                  <p className="font-medium">R$ {registro.valor_unitario.toFixed(2)}</p>
                </div>
              )}
              {registro.valor_total && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Valor Total</p>
                  <p className="font-medium">R$ {registro.valor_total.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Data de Abertura</p>
              <p className="font-medium">
                {format(new Date(registro.data_abertura), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
            {registro.data_analise && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Data de Análise</p>
                <p className="font-medium">
                  {format(new Date(registro.data_analise), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
            {registro.data_resolucao && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Data de Resolução</p>
                <p className="font-medium">
                  {format(new Date(registro.data_resolucao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {registro.resolucao && (
            <div>
              <h4 className="mb-2 font-medium">Resolução</h4>
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {registro.resolucao}
              </p>
            </div>
          )}

          {registro.credito_gerado && registro.valor_credito && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <p className="mb-1 text-xs text-green-400">Crédito Gerado</p>
              <p className="text-lg font-bold text-green-400">
                R$ {registro.valor_credito.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          {uiStatus !== "concluido" && uiStatus !== "recusado" && nextUIStatus && (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange(registro.id, mapUIStatusToDB(nextUIStatus))}>
                Avançar para {statusConfig[nextUIStatus].label}
              </Button>
              <Button variant="destructive" onClick={() => onStatusChange(registro.id, "recusado")}>
                Recusar
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

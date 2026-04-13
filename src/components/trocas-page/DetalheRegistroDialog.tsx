import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TrocaDevolucao, StatusRegistro } from "@/hooks/useTrocasDevolucoes";
import { StatusBadge, TipoBadge, statusConfig, statusWorkflow, motivoLabels, mapStatusToUI, mapUIStatusToDB } from "@/components/trocas";

interface DetalheRegistroDialogProps {
  registro: TrocaDevolucao | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: StatusRegistro) => void;
}

export function DetalheRegistroDialog({ registro, open, onClose, onStatusChange }: DetalheRegistroDialogProps) {
  if (!registro) return null;

  const uiStatus = mapStatusToUI(registro.status);
  const currentIndex = statusWorkflow.indexOf(uiStatus);
  const nextUIStatus = currentIndex < statusWorkflow.length - 1 ? statusWorkflow[currentIndex + 1] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">#{registro.pedido}</span>
            <TipoBadge tipo={registro.tipo} />
            <StatusBadge status={uiStatus} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{registro.produto}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {registro.sku && <div><p className="text-muted-foreground">SKU</p><p className="font-medium">{registro.sku}</p></div>}
              <div><p className="text-muted-foreground">Quantidade</p><p className="font-medium text-primary">{registro.quantidade} peças</p></div>
              <div><p className="text-muted-foreground">Cliente</p><p className="font-medium">{registro.cliente}</p></div>
              {registro.fornecedor && <div><p className="text-muted-foreground">Fornecedor</p><p className="font-medium">{registro.fornecedor}</p></div>}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Progresso do Workflow</h4>
            <div className="flex items-center gap-2">
              {statusWorkflow.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const config = statusConfig[step];
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center flex-1 ${isCurrent ? 'scale-110' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{config.icon}</div>
                      <span className={`text-xs text-center ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{config.label}</span>
                    </div>
                    {index < statusWorkflow.length - 1 && <div className={`h-0.5 w-full ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Informações do Problema</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /><span className="font-medium">{motivoLabels[registro.motivo]}</span></div>
              {registro.descricao_problema && <p className="text-sm text-muted-foreground pl-6">{registro.descricao_problema}</p>}
            </div>
          </div>

          {registro.fotos && registro.fotos.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Fotos</h4>
              <div className="grid grid-cols-3 gap-2">
                {registro.fotos.map((foto, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img src={foto} alt={`Foto ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(registro.valor_unitario || registro.valor_total) && (
            <div className="grid grid-cols-2 gap-4">
              {registro.valor_unitario && <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground mb-1">Valor Unitário</p><p className="font-medium">R$ {registro.valor_unitario.toFixed(2)}</p></div>}
              {registro.valor_total && <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground mb-1">Valor Total</p><p className="font-medium">R$ {registro.valor_total.toFixed(2)}</p></div>}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><p className="text-xs text-muted-foreground mb-1">Data de Abertura</p><p className="font-medium">{format(new Date(registro.data_abertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p></div>
            {registro.data_analise && <div><p className="text-xs text-muted-foreground mb-1">Data de Análise</p><p className="font-medium">{format(new Date(registro.data_analise), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p></div>}
            {registro.data_resolucao && <div><p className="text-xs text-muted-foreground mb-1">Data de Resolução</p><p className="font-medium">{format(new Date(registro.data_resolucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p></div>}
          </div>

          {registro.resolucao && <div><h4 className="font-medium mb-2">Resolução</h4><p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{registro.resolucao}</p></div>}

          {registro.credito_gerado && registro.valor_credito && (
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
              <p className="text-xs text-green-400 mb-1">Crédito Gerado</p>
              <p className="font-bold text-green-400 text-lg">R$ {registro.valor_credito.toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          {uiStatus !== 'concluido' && uiStatus !== 'recusado' && nextUIStatus && (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange(registro.id, mapUIStatusToDB(nextUIStatus))}>Avançar para {statusConfig[nextUIStatus].label}</Button>
              <Button variant="destructive" onClick={() => onStatusChange(registro.id, 'recusado')}>Recusar</Button>
            </div>
          )}
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

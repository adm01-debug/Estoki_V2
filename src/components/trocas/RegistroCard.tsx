import { Card, CardContent } from "@/components/ui/card";
import { Building2, Calendar, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge, TipoBadge, WorkflowProgress, UIStatus } from "@/components/trocas";
import { TrocaDevolucao, StatusRegistro, MotivoTD } from "@/hooks/useTrocasDevolucoes";

export const motivoLabels: Record<MotivoTD, string> = {
  defeito: "Defeito de fabricação",
  cor_errada: "Cor incorreta",
  tamanho_errado: "Tamanho errado",
  quantidade_errada: "Quantidade divergente",
  produto_errado: "Produto incorreto",
  avaria_transporte: "Avaria no transporte",
  desistencia: "Desistência",
  outro: "Outro",
};

export const mapStatusToUI = (status: StatusRegistro): UIStatus => {
  const mapping: Record<StatusRegistro, UIStatus> = {
    aberto: "pendente",
    em_analise: "em_analise",
    aprovado: "autorizado",
    recusado: "recusado",
    em_transito: "enviado",
    recebido: "enviado",
    finalizado: "concluido",
  };
  return mapping[status] || "pendente";
};

export const mapUIStatusToDB = (uiStatus: UIStatus): StatusRegistro => {
  const mapping: Record<UIStatus, StatusRegistro> = {
    pendente: "aberto",
    em_analise: "em_analise",
    autorizado: "aprovado",
    enviado: "em_transito",
    concluido: "finalizado",
    recusado: "recusado",
  };
  return mapping[uiStatus];
};

interface RegistroCardProps {
  registro: TrocaDevolucao;
  onView: () => void;
}

export function RegistroCard({ registro, onView }: RegistroCardProps) {
  const uiStatus = mapStatusToUI(registro.status);

  return (
    <Card className="cursor-pointer transition-colors hover:border-primary/50" onClick={onView}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{registro.pedido}</span>
              <TipoBadge tipo={registro.tipo} />
              <StatusBadge status={uiStatus} />
            </div>
            <h3 className="truncate font-semibold">{registro.produto}</h3>
            {registro.sku && <p className="text-sm text-muted-foreground">SKU: {registro.sku}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{registro.quantidade}</p>
            <p className="text-xs text-muted-foreground">peças</p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{registro.cliente}</span>
          </div>
          {registro.fornecedor && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate">{registro.fornecedor}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="truncate">{motivoLabels[registro.motivo]}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(registro.data_abertura), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
        </div>

        <WorkflowProgress status={uiStatus} />
      </CardContent>
    </Card>
  );
}

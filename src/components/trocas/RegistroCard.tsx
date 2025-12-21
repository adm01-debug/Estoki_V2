import { Card, CardContent } from "@/components/ui/card";
import { Building2, Calendar, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge, TipoBadge, WorkflowProgress, UIStatus } from "@/components/trocas";
import { TrocaDevolucao, StatusRegistro, MotivoTD } from "@/hooks/useTrocasDevolucoes";

export const motivoLabels: Record<MotivoTD, string> = {
  defeito: 'Defeito de fabricação',
  cor_errada: 'Cor incorreta',
  tamanho_errado: 'Tamanho errado',
  quantidade_errada: 'Quantidade divergente',
  produto_errado: 'Produto incorreto',
  avaria_transporte: 'Avaria no transporte',
  desistencia: 'Desistência',
  outro: 'Outro',
};

export const mapStatusToUI = (status: StatusRegistro): UIStatus => {
  const mapping: Record<StatusRegistro, UIStatus> = {
    'aberto': 'pendente',
    'em_analise': 'em_analise',
    'aprovado': 'autorizado',
    'recusado': 'recusado',
    'em_transito': 'enviado',
    'recebido': 'enviado',
    'finalizado': 'concluido',
  };
  return mapping[status] || 'pendente';
};

export const mapUIStatusToDB = (uiStatus: UIStatus): StatusRegistro => {
  const mapping: Record<UIStatus, StatusRegistro> = {
    'pendente': 'aberto',
    'em_analise': 'em_analise',
    'autorizado': 'aprovado',
    'enviado': 'em_transito',
    'concluido': 'finalizado',
    'recusado': 'recusado',
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
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono">#{registro.pedido}</span>
              <TipoBadge tipo={registro.tipo} />
              <StatusBadge status={uiStatus} />
            </div>
            <h3 className="font-semibold truncate">{registro.produto}</h3>
            {registro.sku && <p className="text-sm text-muted-foreground">SKU: {registro.sku}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{registro.quantidade}</p>
            <p className="text-xs text-muted-foreground">peças</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
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
            <span>{format(new Date(registro.data_abertura), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
        </div>
        
        <WorkflowProgress status={uiStatus} />
      </CardContent>
    </Card>
  );
}

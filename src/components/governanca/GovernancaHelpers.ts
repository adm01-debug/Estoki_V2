import { Badge } from '@/components/ui/badge';

export const statusColor: Record<string, string> = {
  pendente: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
  confirmado: 'bg-green-500/15 text-green-700 border-green-500/30',
  rejeitado: 'bg-destructive/15 text-destructive border-destructive/30',
  aberto: 'bg-red-500/15 text-red-700 border-red-500/30',
  investigacao: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  parecer: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
  encerrado: 'bg-muted text-muted-foreground border-border',
};

export const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  rejeitado: 'Rejeitado',
  aberto: 'Aberto',
  investigacao: 'Em Investigação',
  parecer: 'Parecer Emitido',
  encerrado: 'Encerrado',
};

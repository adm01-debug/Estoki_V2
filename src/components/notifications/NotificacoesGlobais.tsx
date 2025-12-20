import { useEffect, useRef } from "react";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { toast } from "sonner";
import { Bell, AlertTriangle, CheckCircle, Info, Package, ClipboardCheck } from "lucide-react";

interface NotificacoesGlobaisProps {
  enabled?: boolean;
}

export function NotificacoesGlobais({ enabled = true }: NotificacoesGlobaisProps) {
  const { notificacoes, naoLidas, marcarComoLida } = useNotificacoes();
  const notificadasRef = useRef<Set<string>>(new Set());

  // Mostrar toast para novas notificações não lidas
  useEffect(() => {
    if (!enabled) return;
    
    const notificacoesRecentes = notificacoes
      .filter(n => !n.lida)
      .filter(n => !notificadasRef.current.has(n.id))
      .filter(n => {
        const criada = new Date(n.created_at);
        const agora = new Date();
        const diffMinutos = (agora.getTime() - criada.getTime()) / (1000 * 60);
        return diffMinutos < 5; // Apenas notificações dos últimos 5 minutos
      });

    notificacoesRecentes.forEach(notif => {
      notificadasRef.current.add(notif.id);
      
      const icone = getIcone(notif.tipo);
      const tipo = getTipoToast(notif.severidade);
      
      if (tipo === 'error') {
        toast.error(notif.titulo, {
          description: notif.mensagem,
          duration: 8000,
          action: {
            label: "Marcar como lida",
            onClick: () => marcarComoLida(notif.id),
          },
        });
      } else if (tipo === 'warning') {
        toast.warning(notif.titulo, {
          description: notif.mensagem,
          duration: 6000,
          action: {
            label: "Marcar como lida",
            onClick: () => marcarComoLida(notif.id),
          },
        });
      } else if (tipo === 'success') {
        toast.success(notif.titulo, {
          description: notif.mensagem,
          duration: 4000,
        });
      } else {
        toast.info(notif.titulo, {
          description: notif.mensagem,
          duration: 5000,
          action: {
            label: "Ver",
            onClick: () => marcarComoLida(notif.id),
          },
        });
      }
    });
  }, [notificacoes, enabled, marcarComoLida]);

  return null; // Componente invisível - apenas gerencia toasts
}

function getIcone(tipo: string) {
  switch (tipo) {
    case 'estoque_baixo':
      return <Package className="h-4 w-4 text-orange-500" />;
    case 'triagem_pendente':
      return <ClipboardCheck className="h-4 w-4 text-blue-500" />;
    case 'recebimento_divergencia':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'recebimento_chegou':
      return <Package className="h-4 w-4 text-green-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
    case 'alerta':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4 text-blue-500" />;
  }
}

function getTipoToast(severidade?: 'info' | 'warning' | 'critical'): 'info' | 'warning' | 'error' | 'success' {
  switch (severidade) {
    case 'critical':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}

export default NotificacoesGlobais;

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import { ConquistaCompleta, BadgeRarity } from "@/hooks/useConquistas";

// Simula storage de conquistas já notificadas
const NOTIFIED_KEY = "notified_achievements";

function getNotifiedAchievements(): string[] {
  try {
    const stored = localStorage.getItem(NOTIFIED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function markAsNotified(achievementId: string) {
  const notified = getNotifiedAchievements();
  if (!notified.includes(achievementId)) {
    notified.push(achievementId);
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
  }
}

// Solicitar permissão para notificações push
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    if (import.meta.env.DEV) console.log("Este navegador não suporta notificações");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Enviar notificação push do navegador
export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: "achievement-notification",
      requireInteraction: false,
      silent: false,
    });

    // Auto-fechar após 5 segundos
    setTimeout(() => notification.close(), 5000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

// Configuração visual por raridade
const raridadeNotificacao: Record<
  BadgeRarity,
  {
    emoji: string;
    bgClass: string;
    sound?: string;
  }
> = {
  comum: { emoji: "🎖️", bgClass: "bg-muted" },
  raro: { emoji: "💎", bgClass: "bg-blue-500/20" },
  epico: { emoji: "🏆", bgClass: "bg-purple-500/20" },
  lendario: { emoji: "👑", bgClass: "bg-amber-500/20" },
};

interface UseConquistaNotificacoesOptions {
  enabled?: boolean;
  showToast?: boolean;
  showBrowserNotification?: boolean;
  onNewAchievement?: (conquista: ConquistaCompleta) => void;
}

export function useConquistaNotificacoes(
  conquistas: ConquistaCompleta[],
  options: UseConquistaNotificacoesOptions = {}
) {
  const {
    enabled = true,
    showToast = true,
    showBrowserNotification = true,
    onNewAchievement,
  } = options;

  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState(false);
  const [lastNotified, setLastNotified] = useState<string[]>([]);

  // Verificar permissão na montagem
  useEffect(() => {
    if (showBrowserNotification && enabled) {
      requestNotificationPermission().then(setHasPermission);
    }
  }, [showBrowserNotification, enabled]);

  // Notificar novas conquistas
  const notifyAchievement = useCallback(
    (conquista: ConquistaCompleta) => {
      const config = raridadeNotificacao[conquista.raridade];

      // Toast notification
      if (showToast) {
        toast({
          title: `${config.emoji} Nova Conquista Desbloqueado!`,
          description: (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{conquista.nome}</span>
              <span className="text-sm text-muted-foreground">{conquista.descricao}</span>
              <span className="mt-1 text-xs font-medium text-warning">+{conquista.pontos} XP</span>
            </div>
          ),
          duration: 6000,
        });
      }

      // Browser push notification
      if (showBrowserNotification && hasPermission) {
        sendBrowserNotification(
          `${config.emoji} Conquista: ${conquista.nome}`,
          `${conquista.descricao}\n+${conquista.pontos} XP`
        );
      }

      // Callback personalizado
      onNewAchievement?.(conquista);

      // Marcar como notificada
      markAsNotified(conquista.id);
    },
    [showToast, showBrowserNotification, hasPermission, toast, onNewAchievement]
  );

  // Verificar conquistas não notificadas
  useEffect(() => {
    if (!enabled) return;

    const notifiedIds = getNotifiedAchievements();
    const desbloqueados = conquistas.filter((c) => c.desbloqueado);

    // Encontrar conquistas desbloqueados mas não notificadas
    const novasConquistas = desbloqueados.filter(
      (c) => !notifiedIds.includes(c.id) && !lastNotified.includes(c.id)
    );

    if (novasConquistas.length > 0) {
      // Notificar com delay entre cada uma para não sobrecarregar
      novasConquistas.forEach((conquista, index) => {
        setTimeout(() => {
          notifyAchievement(conquista);
        }, index * 1500); // 1.5s entre cada notificação
      });

      setLastNotified((prev) => [...prev, ...novasConquistas.map((c) => c.id)]);
    }
  }, [conquistas, enabled, notifyAchievement, lastNotified]);

  // Função para notificar manualmente (útil para testes)
  const notifyManually = useCallback(
    (conquistaId: string) => {
      const conquista = conquistas.find((c) => c.id === conquistaId);
      if (conquista) {
        notifyAchievement(conquista);
      }
    },
    [conquistas, notifyAchievement]
  );

  // Resetar notificações (útil para testes)
  const resetNotifications = useCallback(() => {
    localStorage.removeItem(NOTIFIED_KEY);
    setLastNotified([]);
  }, []);

  return {
    hasPermission,
    requestPermission: requestNotificationPermission,
    notifyManually,
    resetNotifications,
  };
}

// Componente visual de celebração para conquista
interface ConquistaCelebracaoProps {
  conquista: ConquistaCompleta;
  onClose: () => void;
}

export function ConquistaCelebracao({ conquista, onClose }: ConquistaCelebracaoProps) {
  const config = raridadeNotificacao[conquista.raridade];
  const IconComponent = conquista.IconComponent;

  useEffect(() => {
    // Auto-fechar após 5 segundos
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`relative rounded-2xl border-2 p-8 shadow-2xl ${config.bgClass} border-primary/30 duration-500 animate-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Partículas de celebração */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 animate-ping rounded-full bg-warning"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        <div className="relative space-y-4 text-center">
          {/* Ícone grande */}
          <div className="mx-auto flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-warning/20">
            <IconComponent className="h-10 w-10 text-warning" />
          </div>

          {/* Texto */}
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              Conquista Desbloqueado!
            </p>
            <h2 className="mt-1 text-2xl font-bold">{conquista.nome}</h2>
            <p className="mt-2 text-muted-foreground">{conquista.descricao}</p>
          </div>

          {/* XP ganho */}
          <div className="inline-flex items-center gap-2 rounded-full bg-warning/20 px-4 py-2 font-bold text-warning">
            <Trophy className="h-5 w-5" />+{conquista.pontos} XP
          </div>

          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="mx-auto block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Clique para continuar
          </button>
        </div>
      </div>
    </div>
  );
}

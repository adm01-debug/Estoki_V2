import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  Package,
  PackageCheck,
  PackageX,
  Clock,
  Archive,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { useNotificacoes, type Notificacao, type TipoNotificacao } from "@/hooks/useNotificacoes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Severidade = "info" | "warning" | "critical";
type FiltroStatus = "todas" | "nao_lidas" | "lidas";

const SEVERIDADE_CONFIG: Record<Severidade, { label: string; className: string; icon: any }> = {
  info: {
    label: "Informativo",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Info,
  },
  warning: {
    label: "Atenção",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: AlertTriangle,
  },
  critical: {
    label: "Crítico",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertCircle,
  },
};

const TIPO_ICONS: Record<TipoNotificacao | "alerta", any> = {
  estoque_baixo: PackageX,
  triagem_pendente: Clock,
  recebimento: Package,
  recebimento_chegou: Package,
  recebimento_divergencia: AlertTriangle,
  recebimento_conferido: PackageCheck,
  alerta: AlertCircle,
  info: Info,
  success: Check,
  warning: AlertTriangle,
  default: Bell,
};

function getIcon(tipo: TipoNotificacao | "alerta") {
  return TIPO_ICONS[tipo] ?? TIPO_ICONS.default;
}

function getSeveridade(n: Notificacao): Severidade {
  return n.severidade ?? "info";
}

export default function NotificationsPage() {
  const {
    notificacoes,
    loading,
    unreadCount,
    refetch,
    marcarComoLida,
    marcarTodasComoLidas,
    removerNotificacao,
    limparTodas,
  } = useNotificacoes();

  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [expandida, setExpandida] = useState<string | null>(null);

  const notificacoesFiltradas = useMemo(() => {
    return notificacoes.filter((n) => {
      if (filtro === "nao_lidas" && n.lida) return false;
      if (filtro === "lidas" && !n.lida) return false;
      if (tipoFiltro !== "todos" && n.tipo !== tipoFiltro) return false;
      return true;
    });
  }, [notificacoes, filtro, tipoFiltro]);

  const tiposUnicos = useMemo(() => {
    const set = new Set<string>();
    notificacoes.forEach((n) => set.add(n.tipo));
    return Array.from(set).sort();
  }, [notificacoes]);

  const contagem = {
    todas: notificacoes.length,
    nao_lidas: unreadCount,
    lidas: notificacoes.length - unreadCount,
  };

  async function handleMarcarComoLida(id: string) {
    const ok = await marcarComoLida(id);
    if (ok) toast.success("Marcada como lida");
  }

  async function handleMarcarTodas() {
    if (unreadCount === 0) return;
    const ok = await marcarTodasComoLidas();
    if (ok) toast.success(`${unreadCount} notificações marcadas como lidas`);
  }

  async function handleRemover(id: string) {
    const ok = await removerNotificacao(id);
    if (ok) toast.success("Notificação resolvida");
  }

  async function handleLimpar() {
    if (!confirm("Resolver todas as notificações?")) return;
    const ok = await limparTodas();
    if (ok) toast.success("Todas resolvidas");
  }

  return (
    <AppLayout title="Notificações" showBack>
      <PageTransition>
        <div className="space-y-6 p-4 md:p-6">
          {/* Header com estatísticas */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <Bell className="h-6 w-6 text-primary" />
                Central de Notificações
              </h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "s" : ""} não lida${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "Tudo em dia"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarcarTodas}
                disabled={unreadCount === 0}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLimpar}
                disabled={notificacoes.length === 0}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <Archive className="h-4 w-4" />
                Resolver todas
              </Button>
            </div>
          </div>

          {/* Cards de estatísticas por severidade */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(Object.keys(SEVERIDADE_CONFIG) as Severidade[]).map((sev) => {
              const count = notificacoes.filter((n) => !n.lida && getSeveridade(n) === sev).length;
              const cfg = SEVERIDADE_CONFIG[sev];
              const Icon = cfg.icon;
              return (
                <Card key={sev} className="glass-card overflow-hidden">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border",
                          cfg.className
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {cfg.label}
                        </p>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", cfg.className)}>
                      {count === 1 ? "pendente" : "pendentes"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filtros */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4 text-primary" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
              <Tabs
                value={filtro}
                onValueChange={(v) => setFiltro(v as FiltroStatus)}
                className="flex-1"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="todas">
                    Todas{" "}
                    <Badge variant="secondary" className="ml-2">
                      {contagem.todas}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="nao_lidas">
                    Não lidas{" "}
                    <Badge variant="secondary" className="ml-2 bg-primary/20">
                      {contagem.nao_lidas}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="lidas">
                    Lidas{" "}
                    <Badge variant="secondary" className="ml-2">
                      {contagem.lidas}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="md:w-[220px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {tiposUnicos.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Lista */}
          <Tabs value={filtro} onValueChange={(v) => setFiltro(v as FiltroStatus)}>
            <TabsContent value={filtro} className="mt-0 space-y-2">
              {loading && notificacoes.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : notificacoesFiltradas.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Nenhuma notificação por aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {filtro === "nao_lidas"
                        ? "Você está em dia com tudo!"
                        : "Ajuste os filtros para ver outras notificações"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence initial={false}>
                  {notificacoesFiltradas.map((n) => (
                    <NotificationItem
                      key={n.id}
                      item={n}
                      expandida={expandida === n.id}
                      onToggle={() => setExpandida(expandida === n.id ? null : n.id)}
                      onMarcar={() => handleMarcarComoLida(n.id)}
                      onRemover={() => handleRemover(n.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}

interface NotificationItemProps {
  item: Notificacao;
  expandida: boolean;
  onToggle: () => void;
  onMarcar: () => void;
  onRemover: () => void;
}

function NotificationItem({
  item,
  expandida,
  onToggle,
  onMarcar,
  onRemover,
}: NotificationItemProps) {
  const Icon = getIcon(item.tipo);
  const sev = getSeveridade(item);
  const cfg = SEVERIDADE_CONFIG[sev];
  const dataRelativa = formatDistanceToNow(new Date(item.created_at), {
    addSuffix: true,
    locale: ptBR,
  });
  const dataCompleta = format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
    >
      <Card
        className={cn(
          "glass-card cursor-pointer transition-all hover:shadow-lg",
          !item.lida && "border-l-4 border-l-primary",
          item.lida && "opacity-70"
        )}
        onClick={onToggle}
      >
        <CardContent className="flex items-start gap-4 p-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              cfg.className
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={cn(
                      "truncate text-sm",
                      !item.lida ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                    )}
                  >
                    {item.titulo}
                  </h3>
                  {!item.lida && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  <Badge variant="outline" className={cn("text-[9px]", cfg.className)}>
                    {cfg.label}
                  </Badge>
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    expandida ? "" : "line-clamp-2",
                    "text-muted-foreground"
                  )}
                >
                  {item.mensagem}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span title={dataCompleta}>{dataRelativa}</span>
                  <span>•</span>
                  <span className="font-mono">{item.tipo.replace(/_/g, " ")}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {!item.lida && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarcar();
                    }}
                    title="Marcar como lida"
                  >
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemover();
                  }}
                  title="Resolver/Arquivar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandida && item.dados && Object.keys(item.dados).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-3"
              >
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Detalhes
                </p>
                <pre className="whitespace-pre-wrap break-all font-mono text-[11px] text-foreground/80">
                  {JSON.stringify(item.dados, null, 2)}
                </pre>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

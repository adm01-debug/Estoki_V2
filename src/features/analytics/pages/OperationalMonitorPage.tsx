import { memo } from 'react';
import { useOperationalLive, type ActivityItem } from '../hooks/useOperationalLive';
import { DashboardSkeleton } from '@/components/common/PageSkeleton';
import { cn } from '@/lib/utils';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Search,
  Warehouse,
  Wifi,
  WifiOff,
  ListTodo,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ── Live Pulse indicator ──
function LivePulse({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        )}
        <span className={cn(
          "relative inline-flex rounded-full h-3 w-3",
          connected ? "bg-success" : "bg-destructive"
        )} />
      </span>
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {connected ? <><Wifi className="h-3 w-3" /> LIVE</> : <><WifiOff className="h-3 w-3" /> Offline</>}
      </span>
    </div>
  );
}

// ── Metric Card ──
interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  alert?: boolean;
}

const MetricCard = memo(function MetricCard({ label, value, icon, color, subtitle, trend, alert }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-xl bg-card border border-border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
      alert && "border-destructive/50 shadow-destructive/10 shadow-md animate-pulse"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
        {trend && trend !== 'neutral' && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trend === 'up' ? "text-success" : "text-destructive"
          )}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
});

// ── Progress Ring ──
function ProgressRing({ value, size = 80, strokeWidth = 8, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{Math.round(value)}%</span>
    </div>
  );
}

// ── Activity Feed Item ──
function ActivityFeedItem({ item }: { item: ActivityItem }) {
  const iconMap = {
    triagem: <Search className="h-4 w-4" />,
    picking: <ListTodo className="h-4 w-4" />,
    recebimento: <Package className="h-4 w-4" />,
    tarefa: <Activity className="h-4 w-4" />,
    alerta: <AlertTriangle className="h-4 w-4" />,
  };

  const colorMap = {
    triagem: "bg-info/10 text-info",
    picking: "bg-success/10 text-success",
    recebimento: "bg-warning/10 text-warning",
    tarefa: "bg-primary/10 text-primary",
    alerta: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className={cn("p-1.5 rounded-lg", colorMap[item.tipo])}>
        {iconMap[item.tipo]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{item.descricao}</p>
        {item.operador && (
          <p className="text-xs text-muted-foreground">Op. {item.operador}</p>
        )}
      </div>
      <time className="text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(item.timestamp), 'HH:mm', { locale: ptBR })}
      </time>
    </div>
  );
}

// ── Section Header ──
function SectionTitle({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-muted-foreground">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{children}</h3>
    </div>
  );
}

// ── Main Page ──
export default function DashboardOperacional() {
  const { data, isLoading, realtimeStatus } = useOperationalLive();

  if (isLoading || !data) return <DashboardSkeleton />;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-warning" />
            Monitor Operacional
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Atualizado em tempo real — {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </p>
        </div>
        <LivePulse connected={realtimeStatus.isConnected} />
      </div>

      {/* KPI Grid - Primary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard
          label="Picking em Andamento"
          value={data.pickingEmAndamento}
          icon={<ListTodo className="h-5 w-5 text-primary" />}
          color="bg-primary/10"
          subtitle={`${data.pickingConcluidos} concluídos hoje`}
        />
        <MetricCard
          label="Triagens Hoje"
          value={data.triagensHoje}
          icon={<Search className="h-5 w-5 text-info" />}
          color="bg-info/10"
          subtitle={`${data.triagensAprovadas} aprovadas`}
        />
        <MetricCard
          label="Lotes Aguardando"
          value={data.lotesAguardando}
          icon={<Package className="h-5 w-5 text-warning" />}
          color="bg-warning/10"
          subtitle={`${data.lotesDivergencia} com divergência`}
          alert={data.lotesDivergencia > 0}
        />
        <MetricCard
          label="Alertas Ativos"
          value={data.alertasAtivos}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          color="bg-destructive/10"
          subtitle={`${data.alertasCriticos} críticos`}
          alert={data.alertasCriticos > 0}
        />
      </div>

      {/* Middle Row - Rings + Tasks */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Accuracy Rings */}
        <div className="rounded-xl bg-card border border-border p-5">
          <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />}>Acuracidade</SectionTitle>
          <div className="flex items-center justify-around mt-4">
            <div className="text-center">
              <ProgressRing value={data.pickingAcuracidade} color="hsl(var(--success))" />
              <p className="text-xs font-medium text-muted-foreground mt-2">Picking</p>
            </div>
            <div className="text-center">
              <ProgressRing value={data.taxaAprovacao} color="hsl(var(--info))" />
              <p className="text-xs font-medium text-muted-foreground mt-2">Triagem</p>
            </div>
            <div className="text-center">
              <ProgressRing value={data.taxaOcupacao} color="hsl(var(--warning))" />
              <p className="text-xs font-medium text-muted-foreground mt-2">Ocupação</p>
            </div>
          </div>
        </div>

        {/* Task Pipeline */}
        <div className="rounded-xl bg-card border border-border p-5">
          <SectionTitle icon={<ListTodo className="h-4 w-4" />}>Pipeline de Tarefas</SectionTitle>
          <div className="space-y-3 mt-4">
            <TaskBar label="Pendentes" value={data.tarefasPendentes} color="bg-muted-foreground" />
            <TaskBar label="Em Execução" value={data.tarefasEmExecucao} color="bg-warning" />
            <TaskBar label="Concluídas" value={data.tarefasConcluidas} color="bg-success" />
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total: {data.tarefasPendentes + data.tarefasEmExecucao + data.tarefasConcluidas}</span>
              <span className="text-success font-medium">
                {data.tarefasConcluidas > 0
                  ? `${Math.round((data.tarefasConcluidas / (data.tarefasPendentes + data.tarefasEmExecucao + data.tarefasConcluidas)) * 100)}% concluído`
                  : '0% concluído'}
              </span>
            </div>
          </div>
        </div>

        {/* Warehouse Status */}
        <div className="rounded-xl bg-card border border-border p-5">
          <SectionTitle icon={<Warehouse className="h-4 w-4" />}>Armazém</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
              <p className="text-2xl font-bold text-success">{data.posicaoLivres}</p>
              <p className="text-xs text-muted-foreground">Livres</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-2xl font-bold text-primary">{data.posicaoOcupadas}</p>
              <p className="text-xs text-muted-foreground">Ocupadas</p>
            </div>
            <div className="p-3 rounded-lg bg-info/5 border border-info/20 text-center">
              <p className="text-2xl font-bold text-info">{data.lotesConferidos}</p>
              <p className="text-xs text-muted-foreground">Conferidos</p>
            </div>
            <div className={cn(
              "p-3 rounded-lg text-center",
              data.lotesDivergencia > 0 
                ? "bg-destructive/5 border border-destructive/20" 
                : "bg-muted border border-border"
            )}>
              <p className={cn("text-2xl font-bold", data.lotesDivergencia > 0 ? "text-destructive" : "text-muted-foreground")}>
                {data.lotesDivergencia}
              </p>
              <p className="text-xs text-muted-foreground">Divergências</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl bg-card border border-border p-5">
        <SectionTitle icon={<Clock className="h-4 w-4" />}>Atividade Recente</SectionTitle>
        {data.atividadeRecente.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada hoje</p>
          </div>
        ) : (
          <div className="mt-2">
            {data.atividadeRecente.map(item => (
              <ActivityFeedItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground py-2">
        <span>Atualizações: {realtimeStatus.updatesCount}</span>
        {realtimeStatus.lastUpdate && (
          <span>Última: {format(realtimeStatus.lastUpdate, 'HH:mm:ss')}</span>
        )}
      </div>
    </div>
  );
}

// ── Task Bar Component ──
function TaskBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${Math.min(value * 5, 100)}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-foreground w-8 text-right">{value}</span>
    </div>
  );
}

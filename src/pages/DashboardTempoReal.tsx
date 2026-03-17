import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Package, Warehouse, AlertTriangle, TrendingUp, Clock, Users, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface RealtimeKPI {
  totalProdutos: number;
  posicoesCupadas: number;
  posicoesTotal: number;
  lotesAtivos: number;
  triagemHoje: number;
  pickingHoje: number;
  alertasAtivos: number;
  tarefasPendentes: number;
}

export default function DashboardTempoReal() {
  const [kpis, setKpis] = useState<RealtimeKPI>({
    totalProdutos: 0, posicoesCupadas: 0, posicoesTotal: 0,
    lotesAtivos: 0, triagemHoje: 0, pickingHoje: 0,
    alertasAtivos: 0, tarefasPendentes: 0,
  });
  const [feed, setFeed] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [historico, setHistorico] = useState<any[]>([]);

  const fetchKPIs = async () => {
    const hoje = new Date().toISOString().split('T')[0];
    const [produtos, posOcupadas, posTotal, lotes, triagem, picking, alertas, tarefas] = await Promise.all([
      supabase.from('produtos').select('id', { count: 'exact', head: true }),
      supabase.from('posicoes_estoque').select('id', { count: 'exact', head: true }).neq('status', 'livre'),
      supabase.from('posicoes_estoque').select('id', { count: 'exact', head: true }),
      supabase.from('lotes').select('id', { count: 'exact', head: true }).in('status', ['recebido', 'conferido']),
      supabase.from('eventos_triagem').select('id', { count: 'exact', head: true }).gte('data_inicio', hoje),
      supabase.from('eventos_picking').select('id', { count: 'exact', head: true }).gte('data_inicio', hoje),
      supabase.from('alertas_historico').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('tarefas').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    ]);

    setKpis({
      totalProdutos: produtos.count || 0,
      posicoesCupadas: posOcupadas.count || 0,
      posicoesTotal: posTotal.count || 0,
      lotesAtivos: lotes.count || 0,
      triagemHoje: triagem.count || 0,
      pickingHoje: picking.count || 0,
      alertasAtivos: alertas.count || 0,
      tarefasPendentes: tarefas.count || 0,
    });
    setLastUpdate(new Date());
  };

  const fetchFeed = async () => {
    const { data } = await supabase.from('notificacoes').select('*').order('created_at', { ascending: false }).limit(8);
    setFeed(data || []);
  };

  useEffect(() => {
    fetchKPIs();
    fetchFeed();

    // Historico mock para gráfico
    const h = Array.from({ length: 12 }, (_, i) => ({
      hora: `${String(8 + i).padStart(2, '0')}:00`,
      triagem: Math.floor(Math.random() * 20 + 5),
      picking: Math.floor(Math.random() * 15 + 3),
      recebimento: Math.floor(Math.random() * 10 + 2),
    }));
    setHistorico(h);

    const channel = supabase
      .channel('realtime-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos_triagem' }, () => { fetchKPIs(); fetchFeed(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos_picking' }, () => { fetchKPIs(); fetchFeed(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' }, () => { fetchKPIs(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas_historico' }, () => { fetchKPIs(); fetchFeed(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lotes' }, () => { fetchKPIs(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, () => { fetchFeed(); })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    const interval = setInterval(fetchKPIs, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const ocupacao = kpis.posicoesTotal > 0 ? Math.round((kpis.posicoesCupadas / kpis.posicoesTotal) * 100) : 0;

  const kpiCards = [
    { label: 'Produtos Ativos', value: kpis.totalProdutos, icon: Package, color: 'text-primary' },
    { label: 'Ocupação', value: `${ocupacao}%`, icon: Warehouse, color: 'text-info' },
    { label: 'Lotes Ativos', value: kpis.lotesAtivos, icon: TrendingUp, color: 'text-success' },
    { label: 'Triagens Hoje', value: kpis.triagemHoje, icon: Activity, color: 'text-warning' },
    { label: 'Picking Hoje', value: kpis.pickingHoje, icon: Zap, color: 'text-accent-foreground' },
    { label: 'Tarefas Pendentes', value: kpis.tarefasPendentes, icon: Clock, color: 'text-muted-foreground' },
    { label: 'Alertas Ativos', value: kpis.alertasAtivos, icon: AlertTriangle, color: kpis.alertasAtivos > 0 ? 'text-destructive' : 'text-success' },
    { label: 'Posições Livres', value: kpis.posicoesTotal - kpis.posicoesCupadas, icon: Users, color: 'text-info' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📡 Dashboard Tempo Real</h1>
          <p className="text-sm text-muted-foreground">Atualização automática via WebSocket</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {lastUpdate.toLocaleTimeString('pt-BR')}
          </Badge>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <motion.span
                    key={String(kpi.value)}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-2xl font-bold ${kpi.color}`}
                  >
                    {kpi.value}
                  </motion.span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de atividade */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Atividade do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={historico}>
                <defs>
                  <linearGradient id="colorTriagem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPicking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hora" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Area type="monotone" dataKey="triagem" stroke="hsl(var(--primary))" fill="url(#colorTriagem)" strokeWidth={2} name="Triagem" />
                <Area type="monotone" dataKey="picking" stroke="hsl(var(--info))" fill="url(#colorPicking)" strokeWidth={2} name="Picking" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feed ao vivo */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Feed ao Vivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
            <AnimatePresence>
              {feed.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhuma atividade recente</p>
              ) : feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-2.5 rounded-lg bg-muted/30 border border-border/50"
                >
                  <p className="text-xs font-medium text-foreground truncate">{item.titulo}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.mensagem}</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">
                    {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

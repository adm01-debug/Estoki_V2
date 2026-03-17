import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Database, CloudOff, Cloud, Download, Upload, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CachedTable {
  key: string;
  label: string;
  table: string;
  select: string;
  count: number;
  lastSync: string | null;
}

export default function ModoOffline() {
  const { isOnline, pendingOps, cacheData, getCachedData, syncPendingOps } = useOfflineCache();
  const [tables, setTables] = useState<CachedTable[]>([
    { key: 'produtos', label: 'Produtos', table: 'produtos', select: 'id, sku, nome, unidade, curva_abc, estoque_minimo, ponto_pedido', count: 0, lastSync: null },
    { key: 'posicoes', label: 'Posições', table: 'posicoes_estoque', select: 'id, codigo, zona, secao, nivel, status, tipo', count: 0, lastSync: null },
    { key: 'lotes', label: 'Lotes Ativos', table: 'lotes', select: 'id, numero_lote, produto_id, quantidade_atual, status, data_validade, fornecedor', count: 0, lastSync: null },
    { key: 'tarefas', label: 'Tarefas', table: 'tarefas', select: 'id, tipo, status, prioridade, produto_id, posicao_origem_id, posicao_destino_id, quantidade, zona', count: 0, lastSync: null },
  ]);
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem('wms-auto-sync') === 'true');

  const updateTableCount = useCallback((key: string) => {
    const cached = getCachedData<any[]>(key);
    return cached?.length || 0;
  }, [getCachedData]);

  useEffect(() => {
    setTables(prev => prev.map(t => ({
      ...t,
      count: updateTableCount(t.key),
      lastSync: (() => {
        try {
          const item = localStorage.getItem(`wms-cache-${t.key}`);
          if (!item) return null;
          return JSON.parse(item).timestamp ? new Date(JSON.parse(item).timestamp).toLocaleString('pt-BR') : null;
        } catch { return null; }
      })(),
    })));
  }, [updateTableCount]);

  const syncTable = async (table: CachedTable) => {
    try {
      const { data, error } = await supabase.from(table.table as any).select(table.select);
      if (error) throw error;
      await cacheData(table.key, data);
      toast.success(`${table.label} sincronizado (${data?.length || 0} registros)`);
      setTables(prev => prev.map(t => t.key === table.key ? { ...t, count: data?.length || 0, lastSync: new Date().toLocaleString('pt-BR') } : t));
    } catch (e) {
      toast.error(`Erro ao sincronizar ${table.label}`);
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    for (const table of tables) {
      await syncTable(table);
    }
    setSyncing(false);
    toast.success('Todos os dados sincronizados para uso offline!');
  };

  const handleSyncPending = async () => {
    setSyncing(true);
    await syncPendingOps();
    setSyncing(false);
    toast.success('Operações pendentes sincronizadas!');
  };

  const toggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    localStorage.setItem('wms-auto-sync', String(checked));
    if (checked) toast.success('Auto-sync ativado');
  };

  useEffect(() => {
    if (autoSync && isOnline) {
      const interval = setInterval(() => {
        tables.forEach(t => syncTable(t));
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSync, isOnline]);

  const totalCached = tables.reduce((s, t) => s + t.count, 0);
  const cacheSize = (() => {
    let size = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('wms-')) size += (localStorage.getItem(key) || '').length;
    }
    return (size / 1024).toFixed(1);
  })();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📱 Modo Offline</h1>
          <p className="text-sm text-muted-foreground">Gerencie dados offline para operações sem internet</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1.5">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Button onClick={syncAll} disabled={!isOnline || syncing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar Tudo
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Status', value: isOnline ? 'Online' : 'Offline', icon: isOnline ? Cloud : CloudOff, color: isOnline ? 'text-success' : 'text-destructive' },
          { label: 'Registros em Cache', value: totalCached, icon: Database, color: 'text-info' },
          { label: 'Ops Pendentes', value: pendingOps, icon: Upload, color: pendingOps > 0 ? 'text-warning' : 'text-success' },
          { label: 'Tamanho Cache', value: `${cacheSize} KB`, icon: Smartphone, color: 'text-muted-foreground' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <kpi.icon className={`h-7 w-7 ${kpi.color}`} />
                <div>
                  <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pending Operations */}
      {pendingOps > 0 && (
        <Card className="glass-card border-warning/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-semibold">{pendingOps} operação(ões) pendente(s)</p>
                <p className="text-xs text-muted-foreground">Realizadas offline, aguardando sincronização</p>
              </div>
            </div>
            <Button onClick={handleSyncPending} disabled={!isOnline || syncing} size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-2" />Sincronizar Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Auto Sync */}
      <Card className="glass-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Auto-Sync (a cada 5 min)</p>
            <p className="text-xs text-muted-foreground">Sincroniza automaticamente quando online</p>
          </div>
          <Switch checked={autoSync} onCheckedChange={toggleAutoSync} />
        </CardContent>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tables.map((table, i) => (
          <motion.div key={table.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    {table.label}
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => syncTable(table)} disabled={!isOnline}>
                    <Download className="h-3 w-3 mr-1" />Baixar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{table.count} registros em cache</span>
                  {table.count > 0 && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                </div>
                <Progress value={table.count > 0 ? 100 : 0} className="h-1.5" />
                {table.lastSync && (
                  <p className="text-[10px] text-muted-foreground">Último sync: {table.lastSync}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

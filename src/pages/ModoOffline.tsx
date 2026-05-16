 import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
 import { Wifi, WifiOff, RefreshCw, Database, CloudOff, Cloud, Download, Upload, CheckCircle2, AlertTriangle, Smartphone, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
 import AppLayout from "@/components/layout/AppLayout";
 import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
 import { haptics } from "@/utils/haptics";
 import { SEO } from "@/components/common/SEO";

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
     <AppLayout showBack>
       <SEO title="Modo Offline" description="Gerencie dados para uso sem internet." path="/offline" />
       <BasePageTemplate
         title="Modo Offline"
         description="Gestão de cache operacional para produtividade contínua em áreas de baixa conectividade."
         headerActions={
           <div className="flex items-center gap-3">
             <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
               {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
               {isOnline ? 'Sincronizado' : 'Offline'}
             </Badge>
             <Button onClick={() => { haptics.medium(); syncAll(); }} disabled={!isOnline || syncing} size="sm" className="rounded-xl h-10 px-6 font-bold uppercase tracking-tighter glow-button">
               <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
               Sincronizar Tudo
             </Button>
           </div>
         }
       >
         <div className="space-y-6">
           {/* Status Cards */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: 'Rede', value: isOnline ? 'Online' : 'Offline', icon: isOnline ? ShieldCheck : CloudOff, color: isOnline ? 'text-success' : 'text-destructive', bg: isOnline ? 'bg-success/5' : 'bg-destructive/5' },
               { label: 'Registros', value: totalCached, icon: Database, color: 'text-primary', bg: 'bg-primary/5' },
               { label: 'Pendências', value: pendingOps, icon: Upload, color: pendingOps > 0 ? 'text-warning' : 'text-success', bg: pendingOps > 0 ? 'bg-warning/5' : 'bg-success/5' },
               { label: 'Cache Local', value: `${cacheSize} KB`, icon: Smartphone, color: 'text-muted-foreground', bg: 'bg-muted/5' },
             ].map((kpi, i) => (
               <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                 <Card className={cn("border-none shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform", kpi.bg)}>
                   <CardContent className="p-5 flex flex-col gap-4">
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-current opacity-20 transition-opacity group-hover:opacity-40", kpi.color)}>
                       <kpi.icon className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{kpi.label}</p>
                       <p className={cn("text-2xl font-black tracking-tight", kpi.color)}>{kpi.value}</p>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
 
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
               {/* Pending Operations */}
               {pendingOps > 0 && (
                 <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                   <Card className="border-warning/30 bg-warning/5 overflow-hidden">
                     <CardContent className="p-6 flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center">
                           <AlertTriangle className="h-6 w-6 text-warning" />
                         </div>
                         <div>
                           <p className="text-base font-black tracking-tight text-warning-foreground uppercase">{pendingOps} Operações Pendentes</p>
                           <p className="text-xs font-medium text-warning-foreground/70">Dados registrados localmente que precisam ser enviados para a nuvem.</p>
                         </div>
                       </div>
                       <Button onClick={() => { haptics.heavy(); handleSyncPending(); }} disabled={!isOnline || syncing} variant="outline" className="rounded-xl border-warning/30 bg-warning/10 text-warning hover:bg-warning hover:text-white transition-all px-8 h-11 font-bold uppercase tracking-tighter">
                         <Upload className="h-4 w-4 mr-2" />Sincronizar
                       </Button>
                     </CardContent>
                   </Card>
                 </motion.div>
               )}
 
               {/* Tables Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {tables.map((table, i) => (
                   <motion.div key={table.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                     <Card className="border-border/30 shadow-md hover:shadow-lg transition-all group overflow-hidden bg-card/50">
                       <CardHeader className="pb-3 border-b border-border/10">
                         <div className="flex items-center justify-between">
                           <CardTitle className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                             <Database className="h-4 w-4 text-primary" />
                             {table.label}
                           </CardTitle>
                           <Button size="sm" variant="ghost" onClick={() => { haptics.light(); syncTable(table); }} disabled={!isOnline} className="h-8 rounded-lg text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                             <Download className="h-3 w-3 mr-1.5" />Baixar
                           </Button>
                         </div>
                       </CardHeader>
                       <CardContent className="pt-4 space-y-4">
                         <div className="flex items-center justify-between">
                           <div className="space-y-0.5">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">Registros</p>
                             <p className="text-xl font-black">{table.count}</p>
                           </div>
                           <div className={cn("p-2 rounded-xl", table.count > 0 ? "bg-success/10 text-success" : "bg-muted/20 text-muted-foreground")}>
                             <CheckCircle2 className="h-5 w-5" />
                           </div>
                         </div>
                         <div className="space-y-1.5">
                           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: table.count > 0 ? "100%" : "0%" }}
                               className="h-full bg-primary"
                             />
                           </div>
                           {table.lastSync && (
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1">
                               <Clock className="h-2.5 w-2.5" /> Última Sincronização: {table.lastSync}
                             </p>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
               </div>
             </div>
 
             <div className="space-y-6">
               {/* Settings Sidebar */}
               <Card className="border-border/30 shadow-md bg-card/50">
                 <CardHeader className="border-b border-border/10">
                   <CardTitle className="text-xs font-black uppercase tracking-widest">Configurações</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                   <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 border border-border/20">
                     <div className="space-y-1">
                       <p className="text-xs font-black uppercase tracking-tighter">Auto-Sincronização</p>
                       <p className="text-[10px] text-muted-foreground font-medium">Atualiza dados a cada 5 min</p>
                     </div>
                     <Switch checked={autoSync} onCheckedChange={(v) => { haptics.light(); toggleAutoSync(v); }} />
                   </div>
 
                   <div className="p-4 rounded-2xl border border-dashed border-border/40 text-center space-y-2">
                     <Smartphone className="h-8 w-8 mx-auto text-muted-foreground/30" />
                     <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed px-4">O armazenamento local é limitado ao navegador atual.</p>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </div>
         </div>
       </BasePageTemplate>
     </AppLayout>
   );
}

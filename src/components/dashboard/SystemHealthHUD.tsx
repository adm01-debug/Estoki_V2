import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Server, Shield, Database, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const SystemHealthHUD = () => {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<'optimal' | 'degraded' | 'critical'>('optimal');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkLatency = async () => {
      const start = performance.now();
      try {
        await supabase.from('posicao_palete').select('count', { count: 'exact', head: true }).limit(1);
        const end = performance.now();
        const duration = Math.round(end - start);
        setLatency(duration);
        
        if (duration < 200) setStatus('optimal');
        else if (duration < 500) setStatus('degraded');
        else setStatus('critical');
      } catch (e) {
        setStatus('critical');
      }
    };

    checkLatency();
    const interval = setInterval(checkLatency, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 right-6 z-40 hidden md:block">
      <motion.div 
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-xl transition-all shadow-lg",
          status === 'optimal' ? "bg-success/5 border-success/20 text-success" :
          status === 'degraded' ? "bg-warning/5 border-warning/20 text-warning" :
          "bg-destructive/5 border-destructive/20 text-destructive"
        )}
      >
        <div className="relative">
          <Activity className={cn("h-4 w-4", status === 'optimal' && "animate-pulse")} />
          <div className={cn(
            "absolute -top-1 -right-1 w-2 h-2 rounded-full",
            status === 'optimal' ? "bg-success" :
            status === 'degraded' ? "bg-warning" : "bg-destructive"
          )} />
        </div>
        
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          {isExpanded ? "System Health Monitor" : `${latency ?? '--'}ms`}
        </span>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-4 pl-4 border-l border-current/10 ml-1"
            >
              <HealthItem icon={<Database className="h-3 w-3" />} label="Cloud" value="Online" />
              <HealthItem icon={<Server className="h-3 w-3" />} label="Edge" value="Active" />
              <HealthItem icon={<Shield className="h-3 w-3" />} label="Auth" value="Secure" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const HealthItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1 opacity-60">
      {icon}
      <span className="text-[8px] font-bold uppercase">{label}</span>
    </div>
    <span className="text-[9px] font-black">{value}</span>
  </div>
);
*** Update File: src/pages/Dashboard.tsx
@@
 import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
+import { SystemHealthHUD } from "@/components/dashboard/SystemHealthHUD";
 import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
@@
           {kpis && <DashboardKPIs kpis={kpis} />}
+
+          <SystemHealthHUD />
 
           <DashboardCharts 
*** Update File: src/components/common/ErrorBoundary.tsx
@@
 import { createAppError, logError } from '@/config/error-handler';
+import { haptics } from '@/utils/haptics';
+import { motion } from 'framer-motion';
 
 interface Props {
@@
   public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
     this.setState({ errorInfo });
     
+    // Tactile warning for critical failure
+    haptics.error();
+
     // Log error using global handler
@@
   public render() {
     if (this.state.hasError) {
       if (this.props.fallback) {
         return this.props.fallback;
       }
 
       return (
-        <div className="min-h-[400px] flex items-center justify-center p-8">
-          <Card className="max-w-md w-full">
-            <CardHeader>
-              <CardTitle className="flex items-center gap-2 text-destructive">
-                <AlertTriangle className="h-5 w-5" />
-                Algo deu errado
-              </CardTitle>
-            </CardHeader>
-            <CardContent className="space-y-4">
-              <p className="text-muted-foreground">
-                Ocorreu um erro inesperado. Nossa equipe foi notificada.
-              </p>
-
-              {import.meta.env.DEV && this.state.error && (
-                <div className="p-4 bg-muted/50 border border-border/50 rounded-lg text-left overflow-auto max-h-60 shadow-inner">
-                  <p className="text-sm font-mono text-red-600 mb-2">{this.state.error.message}</p>
-                  {this.state.errorInfo && (
-                    <pre className="text-[10px] leading-tight text-muted-foreground/80 font-mono">
-                      {this.state.errorInfo.componentStack}
-                    </pre>
-                  )}
-                </div>
-              )}
-
-              <div className="flex flex-wrap gap-2 justify-center pt-2">
-                <Button variant="outline" onClick={this.handleReset}>
-                  <RefreshCw className="h-4 w-4 mr-2" />
-                  Tentar novamente
-                </Button>
-                <Button variant="outline" onClick={this.handleGoHome}>
-                  <Home className="h-4 w-4 mr-2" />
-                  Início
-                </Button>
-                <Button onClick={this.handleReload}>
-                  Recarregar
-                </Button>
-              </div>
-            </CardContent>
-          </Card>
-        </div>
+        <motion.div 
+          initial={{ opacity: 0, scale: 0.95 }}
+          animate={{ opacity: 1, scale: 1 }}
+          className="min-h-[400px] flex items-center justify-center p-8"
+        >
+          <Card className="max-w-md w-full border-destructive/30 shadow-2xl shadow-destructive/10 overflow-hidden">
+            <div className="h-1 bg-destructive animate-pulse" />
+            <CardHeader>
+              <CardTitle className="flex items-center gap-2 text-destructive">
+                <AlertTriangle className="h-5 w-5" />
+                Ops! Sistema em Modo de Segurança
+              </CardTitle>
+            </CardHeader>
+            <CardContent className="space-y-4">
+              <p className="text-sm text-muted-foreground leading-relaxed">
+                O sistema detectou uma instabilidade crítica. Não se preocupe, seus dados estão seguros. 
+                Você pode tentar reparar o sistema ou voltar ao início.
+              </p>
+
+              {import.meta.env.DEV && this.state.error && (
+                <div className="p-4 bg-muted/50 border border-border/50 rounded-xl text-left overflow-auto max-h-60 shadow-inner group">
+                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Stack Trace</p>
+                  <p className="text-xs font-mono text-destructive mb-2">{this.state.error.message}</p>
+                  {this.state.errorInfo && (
+                    <pre className="text-[10px] leading-tight text-muted-foreground/60 font-mono">
+                      {this.state.errorInfo.componentStack}
+                    </pre>
+                  )}
+                </div>
+              )}
+
+              <div className="flex flex-col gap-2 pt-2">
+                <div className="flex gap-2">
+                  <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={this.handleReset}>
+                    <RefreshCw className="h-4 w-4 mr-2" />
+                    Auto-Reparar
+                  </Button>
+                  <Button className="flex-1 rounded-xl h-11 bg-destructive hover:bg-destructive/90" onClick={this.handleReload}>
+                    Recarregar App
+                  </Button>
+                </div>
+                <Button variant="ghost" className="w-full rounded-xl" onClick={this.handleGoHome}>
+                  <Home className="h-4 w-4 mr-2" />
+                  Voltar à Base
+                </Button>
+              </div>
+            </CardContent>
+          </Card>
+        </motion.div>
       );
     }
 
*** End Patch

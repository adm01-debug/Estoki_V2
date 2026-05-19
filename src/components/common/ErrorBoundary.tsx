import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createAppError, logError } from '@/config/error-handler';
import { haptics } from '@/utils/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isExpanded: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isExpanded: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, isExpanded: false, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Tactile warning for critical failure
    haptics.error();

    // Log error using global handler
    const appError = createAppError(error);
    logError(appError);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, isExpanded: false });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleExpanded = () => {
    this.setState(prev => ({ isExpanded: !prev.isExpanded }));
  };

  private copyToClipboard = () => {
    const debugInfo = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    this.setState({ copied: true });
    toast.success("Informações copiadas para a área de transferência");
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4 md:p-8 bg-background/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-lg"
          >
            <Card className="border-destructive/30 shadow-2xl shadow-destructive/10 overflow-hidden bg-card/80 backdrop-blur-xl">
              <div className="h-1.5 bg-destructive animate-pulse" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-destructive text-xl">
                    <AlertTriangle className="h-6 w-6" />
                    Instabilidade Detectada
                  </CardTitle>
                  <div className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                    Error Boundary
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Ocorreu um erro inesperado que impediu a renderização desta parte do sistema.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Não se preocupe, seus dados locais foram preservados. Você pode tentar reparar o componente ou reiniciar a navegação.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="rounded-xl h-11 border-border/50 hover:bg-muted/50" onClick={this.handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                    Auto-Reparar
                  </Button>
                  <Button className="rounded-xl h-11 bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20" onClick={this.handleReload}>
                    Reiniciar App
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={this.toggleExpanded}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                    >
                      {this.state.isExpanded ? "Ocultar detalhes técnicos" : "Ver detalhes técnicos"}
                    </button>
                    
                    {this.state.isExpanded && (
                      <button 
                        onClick={this.copyToClipboard}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                      >
                        {this.state.copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        {this.state.copied ? "Copiado!" : "Copiar log"}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {this.state.isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-muted/40 border border-border/50 rounded-xl text-left overflow-auto max-h-60 shadow-inner custom-scrollbar">
                          <p className="text-[10px] font-black uppercase text-muted-foreground/70 mb-2 tracking-widest">Diagnostic Report</p>
                          <p className="text-xs font-mono text-destructive mb-3 font-semibold">{this.state.error?.message}</p>
                          {this.state.errorInfo && (
                            <pre className="text-[10px] leading-relaxed text-muted-foreground/60 font-mono">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 py-3 px-6 flex justify-between items-center">
                <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground hover:text-foreground h-8" onClick={this.handleGoHome}>
                  <Home className="h-3.5 w-3.5 mr-2" />
                  Voltar ao Início
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-primary hover:text-primary/80 hover:bg-primary/5 h-8">
                  <MessageSquare className="h-3.5 w-3.5 mr-2" />
                  Suporte
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para usar com componentes funcionais
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

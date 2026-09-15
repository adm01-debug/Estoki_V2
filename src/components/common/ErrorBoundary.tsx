import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createAppError, logError } from "@/config/error-handler";
import { captureException } from "@/lib/sentry";
import { haptics } from "@/utils/haptics";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

    // Rastreio em produção (Sentry) com o componentStack como contexto extra
    captureException(error, { componentStack: errorInfo.componentStack });

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
    window.location.href = "/";
  };

  private toggleExpanded = () => {
    this.setState((prev) => ({ isExpanded: !prev.isExpanded }));
  };

  private copyToClipboard = () => {
    const debugInfo = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
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
        <div className="flex min-h-[400px] items-center justify-center bg-background/50 p-4 backdrop-blur-sm md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-lg"
          >
            <Card className="overflow-hidden border-destructive/30 bg-card/80 shadow-2xl shadow-destructive/10 backdrop-blur-xl">
              <div className="h-1.5 animate-pulse bg-destructive" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    Instabilidade Detectada
                  </CardTitle>
                  <div className="rounded-full bg-destructive/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive">
                    Error Boundary
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Ocorreu um erro inesperado que impediu a renderização desta parte do sistema.
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Não se preocupe, seus dados locais foram preservados. Você pode tentar reparar o
                    componente, reiniciar a navegação ou entrar em contato com o suporte se o erro
                    persistir.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-border/50 hover:bg-muted/50"
                    onClick={this.handleReset}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                    Auto-Reparar
                  </Button>
                  <Button
                    className="h-11 rounded-xl bg-destructive shadow-lg shadow-destructive/20 hover:bg-destructive/90"
                    onClick={this.handleReload}
                  >
                    Reiniciar App
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={this.toggleExpanded}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {this.state.isExpanded
                        ? "Ocultar detalhes técnicos"
                        : "Ver detalhes técnicos"}
                    </button>

                    {this.state.isExpanded && (
                      <button
                        onClick={this.copyToClipboard}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        {this.state.copied ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
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
                        <div className="custom-scrollbar max-h-60 overflow-auto rounded-xl border border-border/50 bg-muted/40 p-4 text-left shadow-inner">
                          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            Diagnostic Report
                          </p>
                          <p className="mb-3 font-mono text-xs font-semibold text-destructive">
                            {this.state.error?.message}
                          </p>
                          {this.state.errorInfo && (
                            <pre className="font-mono text-[10px] leading-relaxed text-muted-foreground/60">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-6 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={this.handleGoHome}
                >
                  <Home className="mr-2 h-3.5 w-3.5" />
                  Voltar ao Início
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-primary hover:bg-primary/5 hover:text-primary/80"
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" />
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

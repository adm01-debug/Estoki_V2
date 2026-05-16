import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAppError, logError } from '@/config/error-handler';
import { haptics } from '@/utils/haptics';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
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
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-[400px] flex items-center justify-center p-8"
        >
          <Card className="max-w-md w-full border-destructive/30 shadow-2xl shadow-destructive/10 overflow-hidden">
            <div className="h-1 bg-destructive animate-pulse" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Ops! Sistema em Modo de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                O sistema detectou uma instabilidade crítica. Não se preocupe, seus dados estão seguros. 
                Você pode tentar reparar o sistema ou voltar ao início.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="p-4 bg-muted/50 border border-border/50 rounded-xl text-left overflow-auto max-h-60 shadow-inner group">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Stack Trace</p>
                  <p className="text-xs font-mono text-destructive mb-2">{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <pre className="text-[10px] leading-tight text-muted-foreground/60 font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={this.handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Auto-Reparar
                  </Button>
                  <Button className="flex-1 rounded-xl h-11 bg-destructive hover:bg-destructive/90" onClick={this.handleReload}>
                    Recarregar App
                  </Button>
                </div>
                <Button variant="ghost" className="w-full rounded-xl" onClick={this.handleGoHome}>
                  <Home className="h-4 w-4 mr-2" />
                  Voltar à Base
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, Sparkles, AlertTriangle, Package } from 'lucide-react';

interface PrevisaoDemanda {
  produto_id: string;
  produto_nome: string;
  demanda_prevista: number;
  tendencia: 'alta' | 'estavel' | 'baixa';
  confianca: number;
  recomendacao: string;
}

interface PrevisaoResult {
  success: boolean;
  previsoes: PrevisaoDemanda[];
  resumo: string;
  periodo: {
    inicio: string;
    fim: string;
  };
}

export function PrevisaoDemandaIA() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrevisaoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gerarPrevisao = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('previsao-demanda', {
        body: {}
      });

      if (fnError) throw fnError;

      if (data.success) {
        setResult(data);
        toast.success('Previsão gerada com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao gerar previsão');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast.error('Erro ao gerar previsão: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'alta':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'baixa':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTendenciaBadge = (tendencia: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      alta: 'default',
      baixa: 'destructive',
      estavel: 'secondary',
    };
    return (
      <Badge variant={variants[tendencia] || 'outline'} className="flex items-center gap-1">
        {getTendenciaIcon(tendencia)}
        {tendencia.charAt(0).toUpperCase() + tendencia.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Previsão de Demanda com IA
          </CardTitle>
          <Button 
            onClick={gerarPrevisao} 
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Previsão
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Clique em "Gerar Previsão" para analisar a demanda dos produtos</p>
            <p className="text-sm mt-2">A IA analisará os últimos 3 meses de movimentações</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {result.resumo && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">Resumo da Análise</p>
                <p className="text-sm text-muted-foreground">{result.resumo}</p>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {result.previsoes.map((previsao, index) => (
                  <Card key={previsao.produto_id || index} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-muted rounded-lg">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{previsao.produto_nome}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {previsao.recomendacao}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {getTendenciaBadge(previsao.tendencia)}
                        <div className="text-right">
                          <p className="text-2xl font-bold">{previsao.demanda_prevista}</p>
                          <p className="text-xs text-muted-foreground">un/mês previsto</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confiança da previsão</span>
                        <span className="font-medium">{previsao.confianca}%</span>
                      </div>
                      <Progress value={previsao.confianca} className="h-1.5 mt-1" />
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground text-center">
              Período analisado: {new Date(result.periodo.inicio).toLocaleDateString('pt-BR')} - {new Date(result.periodo.fim).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

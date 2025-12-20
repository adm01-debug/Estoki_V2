import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFornecedores } from '@/hooks/useFornecedores';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Package,
  Clock,
  Star
} from 'lucide-react';

export function DashboardFornecedores() {
  const { fornecedores, loading, getEstatisticasGerais, getTopFornecedores, getFornecedoresCriticos } = useFornecedores();

  const estatisticas = useMemo(() => getEstatisticasGerais(), [fornecedores]);
  const topFornecedores = useMemo(() => getTopFornecedores(5), [fornecedores]);
  const fornecedoresCriticos = useMemo(() => getFornecedoresCriticos(), [fornecedores]);

  const getClassificacaoBadge = (classificacao: string) => {
    const configs: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      A: { variant: 'default', label: 'A - Excelente' },
      B: { variant: 'secondary', label: 'B - Bom' },
      C: { variant: 'outline', label: 'C - Regular' },
      D: { variant: 'destructive', label: 'D - Crítico' },
    };
    const config = configs[classificacao] || configs.C;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fornecedores</p>
                <p className="text-3xl font-bold">{estatisticas.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pontualidade Média</p>
                <p className="text-3xl font-bold">{estatisticas.pontualidadeMedia?.toFixed(1) || 0}%</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={estatisticas.pontualidadeMedia || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualidade Média</p>
                <p className="text-3xl font-bold">{estatisticas.qualidadeMedia?.toFixed(1) || 0}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={estatisticas.qualidadeMedia || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fornecedores Críticos</p>
                <p className="text-3xl font-bold text-destructive">{fornecedoresCriticos.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Fornecedores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top 5 Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topFornecedores.map((f, i) => (
                    <TableRow key={f.id || i}>
                      <TableCell className="font-medium">{f.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{(f as any).score?.toFixed(0) || 0}</span>
                          <Progress value={(f as any).score || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{getClassificacaoBadge(f.classificacao)}</TableCell>
                      <TableCell>{getTrendIcon(f.tendencia)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Fornecedores Críticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Fornecedores Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {fornecedoresCriticos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                  <p>Nenhum fornecedor crítico</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fornecedoresCriticos.map((f, i) => (
                    <Card key={f.id || i} className="border-destructive/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{f.nome}</p>
                            <p className="text-sm text-muted-foreground">{f.categoria}</p>
                          </div>
                          {getClassificacaoBadge(f.classificacao)}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Pontualidade</p>
                            <p className="font-medium">{(f as any).pontualidadeEntrega?.toFixed(1) || (f as any).pontualidade_entrega?.toFixed(1) || 0}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Qualidade</p>
                            <p className="font-medium">{(f as any).qualidadeProduto?.toFixed(1) || (f as any).qualidade_produto?.toFixed(1) || 0}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taxa Problemas</p>
                            <p className="font-medium text-destructive">{(f as any).taxa_problemas?.toFixed(1) || 0}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Lotes</p>
                            <p className="font-medium">{(f as any).totalLotes || (f as any).total_lotes || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Classificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Distribuição por Classificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {['A', 'B', 'C', 'D'].map(classificacao => {
              const count = fornecedores.filter(f => f.classificacao === classificacao).length;
              const percent = fornecedores.length > 0 ? (count / fornecedores.length) * 100 : 0;
              
              return (
                <div key={classificacao} className="text-center">
                  <div className="mb-2">{getClassificacaoBadge(classificacao)}</div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{percent.toFixed(0)}%</p>
                  <Progress value={percent} className="mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

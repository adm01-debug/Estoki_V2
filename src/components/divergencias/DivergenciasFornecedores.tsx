import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Building2 } from "lucide-react";

interface MetricaFornecedor {
  fornecedor: string;
  total_recebimentos: number;
  total_divergencias: number;
  taxa_divergencia: number;
}

interface Props {
  topFornecedores: { fornecedor: string; taxa_divergencia: number }[];
  metricasFornecedor: MetricaFornecedor[];
}

export function DivergenciasFornecedores({ topFornecedores, metricasFornecedor }: Props) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />Fornecedores Críticos
          </CardTitle>
          <CardDescription>Top 5 fornecedores com maior taxa de divergência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFornecedores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="fornecedor" width={120} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="taxa_divergencia" name="Taxa %" fill="hsl(var(--destructive))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Métricas por Fornecedor</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Recebimentos</TableHead>
                  <TableHead className="text-right">Divergências</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead>Evolução</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricasFornecedor.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum dado encontrado</TableCell></TableRow>
                ) : (
                  metricasFornecedor.sort((a, b) => b.taxa_divergencia - a.taxa_divergencia).slice(0, 10).map((m) => (
                    <TableRow key={m.fornecedor}>
                      <TableCell className="font-medium">{m.fornecedor}</TableCell>
                      <TableCell className="text-right">{m.total_recebimentos}</TableCell>
                      <TableCell className="text-right">{m.total_divergencias}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={m.taxa_divergencia > 20 ? "bg-destructive/10 text-destructive border-destructive/30" : m.taxa_divergencia > 10 ? "bg-warning/10 text-warning border-warning/30" : "bg-success/10 text-success border-success/30"}>
                          {m.taxa_divergencia.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell><Progress value={Math.min(m.taxa_divergencia, 100)} className="h-2 w-20" /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

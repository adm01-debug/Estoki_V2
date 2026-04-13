import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Divergencia {
  id: string;
  numero_lote: string;
  produto_nome: string;
  fornecedor: string;
  quantidade_pedida: number;
  quantidade_recebida: number;
  diferenca: number;
  tipo: "falta" | "sobra";
  data_conferencia: string;
}

interface DivergenciasDetalhesTableProps {
  divergencias: Divergencia[];
}

export function DivergenciasDetalhesTable({ divergencias }: DivergenciasDetalhesTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Divergências ({divergencias.length})
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Pedido</TableHead>
                <TableHead className="text-right">Recebido</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {divergencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma divergência encontrada
                  </TableCell>
                </TableRow>
              ) : (
                divergencias.slice(0, 50).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.numero_lote}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{d.produto_nome}</TableCell>
                    <TableCell>{d.fornecedor}</TableCell>
                    <TableCell className="text-right">{d.quantidade_pedida}</TableCell>
                    <TableCell className="text-right">{d.quantidade_recebida}</TableCell>
                    <TableCell className="text-right">
                      <span className={d.tipo === 'falta' ? 'text-red-500' : 'text-green-500'}>
                        {d.tipo === 'falta' ? '-' : '+'}{d.diferenca}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={d.tipo === 'falta' ? "bg-red-500/10 text-red-700 border-red-500/30" : "bg-green-500/10 text-green-700 border-green-500/30"}>
                        {d.tipo === 'falta' ? <><ArrowDownRight className="h-3 w-3 mr-1" />Falta</> : <><ArrowUpRight className="h-3 w-3 mr-1" />Sobra</>}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(d.data_conferencia), "dd/MM/yy", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {divergencias.length > 50 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Exibindo 50 de {divergencias.length} registros
          </p>
        )}
      </CardContent>
    </Card>
  );
}

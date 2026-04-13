import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { Movimentacao, TipoMovimentacao } from "@/hooks/useMovimentacoes";
import { tipoLabels } from "./RelatorioFilters";

const getTipoColor = (tipo: string) => {
  const colors: Record<string, string> = {
    recebimento_nf: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    armazenamento: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    separacao: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    saida_transporte: "bg-red-500/20 text-red-700 border-red-500/30",
    entrega: "bg-green-500/20 text-green-700 border-green-500/30",
    ajuste_estoque: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  };
  return colors[tipo] || "bg-gray-500/20 text-gray-700 border-gray-500/30";
};

interface RelatorioTableProps {
  dados: Movimentacao[];
  exportando: boolean;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export function RelatorioTable({ dados, exportando, onExportPDF, onExportExcel }: RelatorioTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />Movimentações ({dados.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExportPDF} disabled={exportando}><Download className="h-4 w-4 mr-2" />PDF</Button>
            <Button variant="outline" size="sm" onClick={onExportExcel} disabled={exportando}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada</TableCell></TableRow>
            ) : (
              dados.slice(0, 50).map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="text-sm">{format(new Date(mov.created_at), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell><Badge variant="outline" className={getTipoColor(mov.tipo)}>{tipoLabels[mov.tipo]}</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate">{mov.descricao || mov.produto_nome || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{mov.quantidade || 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{mov.operador_nome || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

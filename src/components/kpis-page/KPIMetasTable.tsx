import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, XCircle, Plus } from "lucide-react";
import type { MetaKPI } from "@/hooks/useKPIsOperacionais";

interface KPIMetasTableProps {
  metas: MetaKPI[];
  onEdit: (meta: MetaKPI) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function KPIMetasTable({ metas, onEdit, onDelete, onNew }: KPIMetasTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNew}><Plus className="h-4 w-4 mr-2" />Nova Meta</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Métrica</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell className="font-medium">{meta.nome}</TableCell>
                  <TableCell>{meta.metrica}</TableCell>
                  <TableCell>
                    <Badge variant={meta.tipo === "maior_melhor" ? "default" : "secondary"}>
                      {meta.tipo === "maior_melhor" ? "Maior é melhor" : "Menor é melhor"}
                    </Badge>
                  </TableCell>
                  <TableCell>{meta.valor_meta}</TableCell>
                  <TableCell>{meta.unidade || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(meta)}><Settings className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(meta.id)}><XCircle className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ConfigAlerta {
  id: string;
  tipo: string;
  descricao: string | null;
  threshold_valor: number | null;
  threshold_dias: number | null;
  ativo: boolean;
}

interface Props {
  configAlertas: ConfigAlerta[];
}

export function AlertasConfigTable({ configAlertas }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Alertas</CardTitle>
        <CardDescription>Configure os limiares para cada tipo de alerta</CardDescription>
      </CardHeader>
      <CardContent>
        {configAlertas.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma configuração encontrada. Configure na tabela alertas_config.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configAlertas.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.tipo}</TableCell>
                  <TableCell>{config.descricao}</TableCell>
                  <TableCell>{config.threshold_valor || config.threshold_dias}</TableCell>
                  <TableCell>
                    <Badge variant={config.ativo ? "default" : "secondary"}>
                      {config.ativo ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

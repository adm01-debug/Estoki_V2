import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, User, MapPin, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Romaneio, StatusRomaneio, StatusEntrega } from "@/hooks/useRomaneios";

const statusConfig: Record<StatusRomaneio, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-muted" },
  confirmado: { label: "Confirmado", color: "bg-blue-500" },
  em_transito: { label: "Em Trânsito", color: "bg-amber-500" },
  entregue: { label: "Entregue", color: "bg-green-500" },
  parcial: { label: "Parcial", color: "bg-orange-500" },
  cancelado: { label: "Cancelado", color: "bg-red-500" },
};

const statusEntregaConfig: Record<StatusEntrega, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_rota: { label: "Em Rota", variant: "default" },
  entregue: { label: "Entregue", variant: "default" },
  recusado: { label: "Recusado", variant: "destructive" },
  parcial: { label: "Parcial", variant: "outline" },
  reagendado: { label: "Reagendado", variant: "secondary" },
};

interface RomaneioDetalhesDialogProps {
  romaneio: Romaneio | null;
  onClose: () => void;
  onFinalizarEntrega: (romaneioId: string, itemId: string, status: StatusEntrega) => void;
}

export function RomaneioDetalhesDialog({ romaneio, onClose, onFinalizarEntrega }: RomaneioDetalhesDialogProps) {
  if (!romaneio) return null;

  const config = statusConfig[romaneio.status];

  return (
    <Dialog open={!!romaneio} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Romaneio {romaneio.codigo}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div><p className="text-sm text-muted-foreground">Motorista</p><p className="font-medium">{romaneio.motorista || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Placa</p><p className="font-medium">{romaneio.placa_veiculo || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><Badge className={config.color}>{config.label}</Badge></div>
            <div><p className="text-sm text-muted-foreground">Previsão</p><p className="font-medium">{romaneio.data_prevista_entrega ? format(new Date(romaneio.data_prevista_entrega), "dd/MM/yyyy", { locale: ptBR }) : "-"}</p></div>
          </div>

          {romaneio.itens && romaneio.itens.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Volumes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {romaneio.itens.map(item => {
                    const entregaConfig = statusEntregaConfig[item.status_entrega];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.destinatario}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{item.endereco_entrega}</TableCell>
                        <TableCell>{item.volumes}</TableCell>
                        <TableCell><Badge variant={entregaConfig.variant}>{entregaConfig.label}</Badge></TableCell>
                        <TableCell>
                          {romaneio.status === "em_transito" && item.status_entrega === "pendente" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" onClick={() => onFinalizarEntrega(romaneio.id, item.id, "entregue")}>Entregue</Button>
                              <Button size="sm" variant="destructive" onClick={() => onFinalizarEntrega(romaneio.id, item.id, "recusado")}>Recusado</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum item neste romaneio</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

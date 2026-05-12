import { Button } from "@/components/ui/button";
import { Eye, ArrowLeftRight, PackageOpen, Package, UserX, UserCheck } from "lucide-react";
import type { PosicaoEstoque } from "@/hooks/useEstoque";
import { useEstoque } from "@/hooks/useEstoque";
import { toast } from "sonner";

export function PosicaoActions({ position }: { position: PosicaoEstoque }) {
  const { updatePosicao } = useEstoque();

  const handleToggleStatus = async (newStatus: "livre" | "bloqueado" | "reservado") => {
    try {
      await updatePosicao.mutateAsync({ 
        id: position.id, 
        status: newStatus,
        // @ts-ignore - custom field for audit log
        motivo: newStatus === "bloqueado" ? "Bloqueio manual via detalhes" : "Liberação manual via detalhes"
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex gap-2 pt-2">
      {position.status === "ocupado" && (
        <>
          <Button variant="outline" className="flex-1 gap-2"><Eye className="h-4 w-4" />Ver Rastreio</Button>
          <Button variant="outline" className="flex-1 gap-2"><ArrowLeftRight className="h-4 w-4" />Mover</Button>
          <Button className="flex-1 gap-2"><PackageOpen className="h-4 w-4" />Separar</Button>
        </>
      )}
      {position.status === "livre" && (
        <Button className="flex-1 gap-2"><Package className="h-4 w-4" />Alocar Produto</Button>
      )}
      {position.status === "bloqueado" && (
        <Button variant="outline" className="flex-1 gap-2" onClick={() => handleToggleStatus("livre")}>
          <UserCheck className="h-4 w-4" /> Liberar Posição
        </Button>
      )}
      {position.status === "reservado" && (
        <Button variant="outline" className="flex-1 gap-2" onClick={() => handleToggleStatus("livre")}>
          <UserCheck className="h-4 w-4" /> Cancelar Reserva
        </Button>
      )}
      {position.status === "livre" && (
        <Button variant="destructive" className="flex-1 gap-2" onClick={() => handleToggleStatus("bloqueado")}>
          <UserX className="h-4 w-4" /> Bloquear Posição
        </Button>
      )}
    </div>
  );
}

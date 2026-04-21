import { Button } from "@/components/ui/button";
import { Eye, ArrowLeftRight, PackageOpen, Package } from "lucide-react";
import type { PosicaoEstoque } from "@/hooks/useEstoque";

export function PosicaoActions({ position }: { position: PosicaoEstoque }) {
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
      {(position.status === "reservado" || position.status === "bloqueado") && (
        <Button variant="outline" className="flex-1">Alterar Status</Button>
      )}
    </div>
  );
}

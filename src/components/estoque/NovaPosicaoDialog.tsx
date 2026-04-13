import { useState } from "react";
import { Plus, Warehouse, Box } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortaPaleteForm } from "./PortaPaleteForm";
import { BoxForm } from "./BoxForm";

interface NovaPosicaoDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function NovaPosicaoDialog({ onSuccess, children }: NovaPosicaoDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"porta_palete" | "box">("porta_palete");

  const handleSuccess = () => { onSuccess?.(); };
  const handleClose = () => { setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2"><Plus className="h-4 w-4" />Nova Posição</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Posição de Estoque</DialogTitle>
          <DialogDescription>Adicione novas posições de porta-palete ou boxes ao seu armazém</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="porta_palete" className="gap-2"><Warehouse className="h-4 w-4" />Porta-Palete</TabsTrigger>
            <TabsTrigger value="box" className="gap-2"><Box className="h-4 w-4" />Box</TabsTrigger>
          </TabsList>
          <TabsContent value="porta_palete" className="space-y-4 mt-4">
            <PortaPaleteForm onSuccess={handleSuccess} onClose={handleClose} />
          </TabsContent>
          <TabsContent value="box" className="space-y-4 mt-4">
            <BoxForm onSuccess={handleSuccess} onClose={handleClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { gerarCodigoOnda } from "@/lib/codigoOnda";

export function NovoOndaDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    codigo: string;
    descricao: string;
    prioridade: "alta" | "baixa" | "media" | "urgente";
    zona_alvo: string;
    rota: string;
  }>({
    codigo: gerarCodigoOnda(),
    descricao: "",
    prioridade: "media",
    zona_alvo: "",
    rota: "",
  });

  const abrirComCodigoNovo = (aberto: boolean) => {
    setOpen(aberto);
    // O codigo e gerado no mount do componente; se o dialog ficar muito tempo
    // fechado dois usuarios poderiam receber o mesmo valor.
    if (aberto) setFormData((atual) => ({ ...atual, codigo: gerarCodigoOnda() }));
  };

  const codigoJaExiste = async (codigo: string) => {
    const { data, error } = await supabase
      .from("ondas_separacao")
      .select("id")
      .eq("codigo", codigo)
      .limit(1);
    if (error) throw error;
    return (data ?? []).length > 0;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let codigo = formData.codigo.trim();

      for (let tentativa = 0; tentativa < 5; tentativa++) {
        if (!(await codigoJaExiste(codigo))) break;
        codigo = gerarCodigoOnda();
      }

      const { error } = await supabase.from("ondas_separacao").insert([
        {
          ...formData,
          codigo,
          status: "pendente",
          data_criacao: new Date().toISOString(),
          total_tarefas: 0,
          tarefas_concluidas: 0,
        },
      ]);

      if (error) throw error;

      toast.success("Onda de separação criada!");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error("Erro ao criar onda");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={abrirComCodigoNovo}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Onda</span>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Nova Onda de Separação</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (saving) return;
            handleSave();
          }}
        >
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(v) => setFormData({ ...formData, prioridade: v as any })}
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Pedidos E-commerce Manhã"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zona-alvo">Zona Alvo</Label>
                <Input
                  id="zona-alvo"
                  value={formData.zona_alvo}
                  onChange={(e) => setFormData({ ...formData, zona_alvo: e.target.value })}
                  placeholder="Ex: A, B, C"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rota">Rota</Label>
                <Input
                  id="rota"
                  value={formData.rota}
                  onChange={(e) => setFormData({ ...formData, rota: e.target.value })}
                  placeholder="Ex: Norte"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Onda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRecebimentos } from "../hooks/useRecebimentos";
import { Produto, RecebimentoFormData, recebimentoSchema } from "./novo-recebimento/types";
import { FormFields } from "./novo-recebimento/FormFields";

interface NovoRecebimentoDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const INITIAL_FORM_DATA: RecebimentoFormData = {
  produto_id: "",
  numero_lote: "",
  fornecedor: "",
  nf_entrada: "",
  quantidade_pedida: 0,
  quantidade: 0,
  previsao_chegada: "",
  pedido_compra: "",
  data_validade: "",
  data_fabricacao: "",
  status: "aguardando",
};

export function NovoRecebimentoDialog({ trigger, onSuccess }: NovoRecebimentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { createRecebimento } = useRecebimentos();

  const [formData, setFormData] = useState<RecebimentoFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoadingProdutos(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, sku, fornecedor_principal")
        .order("nome");

      if (!error && data) {
        setProdutos((data || []).map(p => ({ 
          id: p.id,
          nome: p.nome,
          sku: p.sku,
          fornecedor_principal: p.fornecedor_principal ?? undefined 
        })));
      }
      setLoadingProdutos(false);
    };

    if (open) {
      fetchProdutos();
    }
  }, [open]);

  const validateForm = (): boolean => {
    try {
      recebimentoSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const result = await createRecebimento.mutateAsync({
      produto_id: formData.produto_id,
      numero_lote: formData.numero_lote,
      fornecedor: formData.fornecedor || undefined,
      nf_entrada: formData.nf_entrada || undefined,
      quantidade: formData.quantidade,
      quantidade_pedida: formData.quantidade_pedida,
      previsao_chegada: formData.previsao_chegada || undefined,
      pedido_compra: formData.pedido_compra || undefined,
      data_validade: formData.data_validade || undefined,
      data_fabricacao: formData.data_fabricacao || undefined,
    });

    setLoading(false);

    if (result) {
      setOpen(false);
      resetForm();
      onSuccess?.();
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Novo Recebimento
          </DialogTitle>
          <DialogDescription>
            Registre um novo lote para recebimento e conferência.
          </DialogDescription>
        </DialogHeader>

        <FormFields
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          produtos={produtos}
          loadingProdutos={loadingProdutos}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRecebimentos } from "@/hooks/useRecebimentos";
// @ts-nocheck
const recebimentoSchema = z.object({
  produto_id: z.string().uuid({ message: "Selecione um produto" }),
  numero_lote: z.string().trim().min(1, { message: "Número do lote é obrigatório" }).max(50, { message: "Máximo 50 caracteres" }),
  fornecedor: z.string().trim().max(100, { message: "Máximo 100 caracteres" }).optional(),
  nf_entrada: z.string().trim().max(50, { message: "Máximo 50 caracteres" }).optional(),
  quantidade_pedida: z.number().int().positive({ message: "Quantidade deve ser maior que 0" }),
  quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que 0" }),
  previsao_chegada: z.string().optional(),
  pedido_compra: z.string().trim().max(50, { message: "Máximo 50 caracteres" }).optional(),
  data_validade: z.string().optional(),
  data_fabricacao: z.string().optional(),
  status: z.enum(['aguardando', 'em_transito', 'recebido', 'em_conferencia', 'conferido', 'divergencia', 'cancelado']),
});

type RecebimentoFormData = z.infer<typeof recebimentoSchema>;

interface Produto {
  id: string;
  nome: string;
  sku: string;
  fornecedor_principal?: string;
}

interface NovoRecebimentoDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function NovoRecebimentoDialog({ trigger, onSuccess }: NovoRecebimentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { createRecebimento } = useRecebimentos();

  const [formData, setFormData] = useState<RecebimentoFormData>({
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
  });

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoadingProdutos(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, sku, fornecedor_principal")
        .order("nome");

      if (!error && data) {
        setProdutos(data);
      }
      setLoadingProdutos(false);
    };

    if (open) {
      fetchProdutos();
    }
  }, [open]);

  const handleProdutoChange = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    setFormData(prev => ({
      ...prev,
      produto_id: produtoId,
      fornecedor: produto?.fornecedor_principal || prev.fornecedor,
    }));
    setErrors(prev => ({ ...prev, produto_id: "" }));
  };

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
    setFormData({
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
    });
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

        <div className="space-y-4 py-4">
          {/* Produto */}
          <div className="space-y-2">
            <Label htmlFor="produto">Produto *</Label>
            {loadingProdutos ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando produtos...
              </div>
            ) : (
              <Select value={formData.produto_id} onValueChange={handleProdutoChange}>
                <SelectTrigger className={errors.produto_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome} ({produto.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.produto_id && <p className="text-xs text-destructive">{errors.produto_id}</p>}
          </div>

          {/* Número do Lote e Pedido de Compra */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_lote">Número do Lote *</Label>
              <Input
                id="numero_lote"
                placeholder="Ex: LOTE-2024-001"
                value={formData.numero_lote}
                onChange={(e) => {
                  setFormData({ ...formData, numero_lote: e.target.value });
                  setErrors(prev => ({ ...prev, numero_lote: "" }));
                }}
                className={errors.numero_lote ? "border-destructive" : ""}
                maxLength={50}
              />
              {errors.numero_lote && <p className="text-xs text-destructive">{errors.numero_lote}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pedido_compra">Pedido de Compra</Label>
              <Input
                id="pedido_compra"
                placeholder="Ex: PC-2024-001"
                value={formData.pedido_compra}
                onChange={(e) => setFormData({ ...formData, pedido_compra: e.target.value })}
                maxLength={50}
              />
            </div>
          </div>

          {/* Fornecedor e NF */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                placeholder="Nome do fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nf_entrada">NF de Entrada</Label>
              <Input
                id="nf_entrada"
                placeholder="Ex: 123456"
                value={formData.nf_entrada}
                onChange={(e) => setFormData({ ...formData, nf_entrada: e.target.value })}
                maxLength={50}
              />
            </div>
          </div>

          {/* Quantidades */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade_pedida">Quantidade Pedida *</Label>
              <Input
                id="quantidade_pedida"
                type="number"
                min={1}
                value={formData.quantidade_pedida || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setFormData({ 
                    ...formData, 
                    quantidade_pedida: val,
                    quantidade: formData.quantidade || val 
                  });
                  setErrors(prev => ({ ...prev, quantidade_pedida: "" }));
                }}
                className={errors.quantidade_pedida ? "border-destructive" : ""}
              />
              {errors.quantidade_pedida && <p className="text-xs text-destructive">{errors.quantidade_pedida}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade Inicial *</Label>
              <Input
                id="quantidade"
                type="number"
                min={1}
                value={formData.quantidade || ""}
                onChange={(e) => {
                  setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 });
                  setErrors(prev => ({ ...prev, quantidade: "" }));
                }}
                className={errors.quantidade ? "border-destructive" : ""}
              />
              {errors.quantidade && <p className="text-xs text-destructive">{errors.quantidade}</p>}
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previsao_chegada">Previsão de Chegada</Label>
              <Input
                id="previsao_chegada"
                type="date"
                value={formData.previsao_chegada}
                onChange={(e) => setFormData({ ...formData, previsao_chegada: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
              />
            </div>
          </div>

          {/* Data de Fabricação e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_fabricacao">Data de Fabricação</Label>
              <Input
                id="data_fabricacao"
                type="date"
                value={formData.data_fabricacao}
                onChange={(e) => setFormData({ ...formData, data_fabricacao: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status Inicial</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguardando">Aguardando</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

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

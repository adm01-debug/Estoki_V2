import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Produto, RecebimentoFormData } from "./types";

interface FormFieldsProps {
  formData: RecebimentoFormData;
  setFormData: (data: RecebimentoFormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  produtos: Produto[];
  loadingProdutos: boolean;
}

export function FormFields({
  formData,
  setFormData,
  errors,
  setErrors,
  produtos,
  loadingProdutos,
}: FormFieldsProps) {
  const handleProdutoChange = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    setFormData({
      ...formData,
      produto_id: produtoId,
      fornecedor: produto?.fornecedor_principal || formData.fornecedor,
    });
    setErrors({ ...errors, produto_id: "" });
  };

  return (
    <div className="space-y-4 py-4">
      {/* Produto */}
      <div className="space-y-2">
        <Label htmlFor="produto">Produto *</Label>
        <div className="relative">
          {loadingProdutos ? (
            <div className="flex items-center gap-2 text-muted-foreground py-2 px-3 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando produtos...
            </div>
          ) : (
            <Select value={formData.produto_id} onValueChange={handleProdutoChange}>
              <SelectTrigger className={errors.produto_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {produtos.length === 0 ? (
                  <div className="p-2 text-sm text-center text-muted-foreground">Nenhum produto encontrado</div>
                ) : (
                  produtos.map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{produto.nome}</span>
                        <span className="text-[10px] text-muted-foreground">SKU: {produto.sku}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
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
              setErrors({ ...errors, numero_lote: "" });
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
              setErrors({ ...errors, quantidade_pedida: "" });
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
              setErrors({ ...errors, quantidade: "" });
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
  );
}

import { Package, MapPin, Layers, LucideIcon } from "lucide-react";

export interface ImportTemplate {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  headers: string[];
  table: string;
}

export const IMPORT_TEMPLATES: ImportTemplate[] = [
  { 
    id: "produtos", 
    icon: Package, 
    label: "Produtos", 
    description: "SKU, nome, descrição, unidade, curva ABC",
    headers: ["sku", "nome", "descricao", "unidade", "curva_abc", "estoque_minimo", "estoque_maximo", "ponto_pedido", "fornecedor_principal"],
    table: "produtos",
  },
  { 
    id: "posicoes", 
    icon: MapPin, 
    label: "Posições", 
    description: "Código, zona, tipo, capacidade",
    headers: ["codigo", "zona", "tipo", "porta_palete", "secao", "nivel", "box", "capacidade_kg"],
    table: "posicoes_estoque",
  },
  { 
    id: "lotes", 
    icon: Layers, 
    label: "Lotes", 
    description: "Número, produto, quantidade, validade",
    headers: ["numero_lote", "produto_sku", "quantidade_inicial", "quantidade_atual", "data_validade", "data_fabricacao", "fornecedor", "nf_entrada"],
    table: "lotes",
  },
];

export interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
  total: number;
}

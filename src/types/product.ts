import { Database } from "@/integrations/supabase/types";

export type Produto = Database["public"]["Tables"]["produtos"]["Row"];
export type ProdutoInsert = Database["public"]["Tables"]["produtos"]["Insert"];
export type ProdutoUpdate = Database["public"]["Tables"]["produtos"]["Update"];

export interface ProdutoComEstoque extends Produto {
  estoque?: {
    quantidade: number;
    posicao: {
      codigo: string;
      zona: string | null;
    };
  }[];
}

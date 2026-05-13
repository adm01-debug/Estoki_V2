  import { supabase } from "@/lib/supabase";
  import { Database } from "@/integrations/supabase/types";
  import { logger } from "@/utils/logger";
  
  type Produto = Database['public']['Tables']['produtos']['Row'];
  type ProdutoUpdate = Database['public']['Tables']['produtos']['Update'];

export const barcodeService = {
   async findByBarcode(barcode: string): Promise<Produto | null> {
     try {
       const { data, error } = await supabase
         .from("produtos")
         .select("*")
         .eq("barcode", barcode)
         .maybeSingle();

       if (error) throw error;
       return data;
     } catch (error) {
       logger.error("Erro ao buscar produto por código de barras", error, { barcode });
       throw error;
     }
  },

  async associateBarcode(productId: string, barcode: string): Promise<void> {
     try {
       const { error } = await supabase
         .from("produtos")
         .update({ barcode } as ProdutoUpdate)
         .eq("id", productId);

       if (error) throw error;
       logger.info("Código de barras associado com sucesso", { productId, barcode });
     } catch (error) {
       logger.error("Erro ao associar código de barras", error, { productId, barcode });
       throw error;
     }
  },

  async generateBarcode(type: 'EAN13' | 'CODE128'): Promise<string> {
    // Implementação simplificada de geração
    const prefix = type === 'EAN13' ? '789' : 'EST';
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${prefix}${random}`;
  }
};

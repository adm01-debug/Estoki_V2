  import { supabase } from "@/integrations/supabase/client";
  import { Database } from "@/integrations/supabase/types";
  
  type Produto = Database['public']['Tables']['produtos']['Row'];

export const barcodeService = {
   async findByBarcode(barcode: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("barcode", barcode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async associateBarcode(productId: string, barcode: string): Promise<void> {
    const { error } = await supabase
      .from("produtos")
       .update({ barcode })
      .eq("id", productId);

    if (error) throw error;
  },

  async generateBarcode(type: 'EAN13' | 'CODE128'): Promise<string> {
    // Implementação simplificada de geração
    const prefix = type === 'EAN13' ? '789' : 'EST';
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${prefix}${random}`;
  }
};

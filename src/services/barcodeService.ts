import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { logger } from "@/utils/logger";

type Produto = Database["public"]["Tables"]["produtos"]["Row"];
type ProdutoUpdate = Database["public"]["Tables"]["produtos"]["Update"];

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

  async generateBarcode(type: "EAN13" | "CODE128"): Promise<string> {
    const random = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, "0");

    if (type === "EAN13") {
      // 12 dígitos base (prefixo 789 = Brasil) + dígito verificador EAN-13
      const base = `789${random}`;
      let soma = 0;
      for (let i = 0; i < 12; i++) {
        soma += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
      }
      const digitoVerificador = (10 - (soma % 10)) % 10;
      return `${base}${digitoVerificador}`;
    }

    return `EST${random}`;
  },
};

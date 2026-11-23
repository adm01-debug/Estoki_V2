import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { Romaneio, RomaneioInput, StatusRomaneio, StatusEntrega } from "../types";
import type { TablesUpdate } from "@/integrations/supabase/types";

export const shippingService = {
  async getRomaneios(): Promise<Romaneio[]> {
    const { data, error } = await supabase
      .from("romaneios")
      .select(
        `
        *,
        romaneio_itens (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar romaneios", error);
      throw error;
    }

    return (data || []).map((r) => ({
      id: r.id,
      codigo: r.codigo,
      data_criacao: r.data_criacao,
      data_prevista_entrega: r.data_prevista_entrega || undefined,
      data_saida: r.data_saida || undefined,
      data_retorno: r.data_retorno || undefined,
      motorista: r.motorista || undefined,
      placa_veiculo: r.placa_veiculo || undefined,
      tipo_veiculo: r.tipo_veiculo || undefined,
      rota: r.rota || undefined,
      status: r.status as StatusRomaneio,
      total_entregas: r.total_entregas || 0,
      entregas_realizadas: r.entregas_realizadas || 0,
      total_volumes: r.total_volumes || 0,
      total_peso_kg: r.total_peso_kg || 0,
      itens: (r.romaneio_itens || []).map((item: any) => ({
        id: item.id,
        romaneio_id: item.romaneio_id,
        cliente: item.cliente,
        endereco_entrega: item.endereco_entrega,
        telefone_cliente: item.telefone_cliente,
        quantidade: item.quantidade,
        peso_kg: item.peso_kg,
        ordem_entrega: item.ordem_entrega,
        nf_saida: item.nf_saida,
        observacoes: item.observacoes,
        status: item.status as StatusEntrega,
      })),
    }));
  },

  async criarRomaneio(input: RomaneioInput): Promise<Romaneio> {
    const codigo = `ROM-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from("romaneios")
      .insert({
        codigo,
        motorista: input.motorista,
        placa_veiculo: input.placa_veiculo,
        tipo_veiculo: input.tipo_veiculo,
        data_prevista_entrega: input.data_prevista_entrega,
        rota: input.rota,
        observacoes: input.observacoes,
        status: "rascunho",
      })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar romaneio", error);
      throw error;
    }
    return data as any;
  },

  async confirmarRomaneio(id: string): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Nao autenticado");

    const { error } = await supabase
      .from("romaneios")
      .update({ status: "confirmado", responsavel_id: user.id })
      .eq("id", id)
      .eq("status", "rascunho");

    if (error) {
      logger.error("Erro ao confirmar romaneio", error, { id });
      throw error;
    }
  },

  async atualizarStatus(id: string, status: StatusRomaneio): Promise<void> {
    const updates: TablesUpdate<"romaneios"> = { status };
    if (status === "em_transito") {
      updates.data_saida = new Date().toISOString();
    } else if (status === "entregue" || status === "parcial") {
      updates.data_retorno = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("romaneios")
      .update(updates)
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      logger.error("Erro ao atualizar status do romaneio", error, { id, status });
      throw error;
    }
    if (!data) {
      throw new Error("Romaneio não encontrado ou sem permissão para atualizar o status");
    }
  },

  async cancelarRomaneio(id: string, motivo?: string): Promise<void> {
    const { data: atual, error: fetchError } = await supabase
      .from("romaneios")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError) {
      logger.error("Erro ao buscar romaneio para cancelar", fetchError, { id });
      throw fetchError;
    }
    if (!atual) {
      throw new Error("Romaneio não encontrado");
    }
    if (atual.status === "entregue" || atual.status === "cancelado") {
      throw new Error("Este romaneio não pode ser cancelado");
    }

    const updates: TablesUpdate<"romaneios"> = { status: "cancelado" };
    if (motivo) {
      updates.observacoes = motivo;
    }

    const { data, error } = await supabase
      .from("romaneios")
      .update(updates)
      .eq("id", id)
      .eq("status", atual.status)
      .select("id")
      .single();

    if (error) {
      logger.error("Erro ao cancelar romaneio", error, { id });
      throw error;
    }
    if (!data) {
      throw new Error("Romaneio já foi alterado por outro usuário; tente novamente");
    }
  },

  async registrarEntrega(
    romaneioId: string,
    itemId: string,
    status: StatusEntrega,
    dados?: any
  ): Promise<void> {
    const { error: comprovanteError } = await supabase.from("comprovantes_entrega").insert({
      romaneio_id: romaneioId,
      romaneio_item_id: itemId,
      status,
      data_entrega: status === "entregue" ? new Date().toISOString() : null,
      recebedor_nome: dados?.recebedor_nome,
      recebedor_documento: dados?.recebedor_documento,
      assinatura_url: dados?.assinatura_url,
      foto_entrega_url: dados?.foto_entrega_url,
      observacoes: dados?.observacoes,
    });

    if (comprovanteError) {
      logger.error("Erro ao registrar comprovante de entrega", comprovanteError);
      throw comprovanteError;
    }
  },
};

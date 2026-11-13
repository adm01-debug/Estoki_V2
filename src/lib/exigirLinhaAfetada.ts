import type { PostgrestError } from "@supabase/supabase-js";

/**
 * UPDATE/DELETE bloqueados pela RLS (cláusula USING) não dão erro no PostgREST: afetam 0 linhas e
 * voltam "sucesso". Sem esta checagem a tela mostrava "atualizado"/"removido" sem ter feito nada.
 * Use com `.select("id")` no fim da query, para o PostgREST devolver as linhas afetadas.
 */
export function exigirLinhaAfetada(
  resultado: { data: unknown[] | null; error: PostgrestError | null },
  acao: string
): void {
  if (resultado.error) throw resultado.error;
  if (!resultado.data || resultado.data.length === 0) {
    throw new Error(`Sem permissão para ${acao}, ou o registro não existe mais.`);
  }
}

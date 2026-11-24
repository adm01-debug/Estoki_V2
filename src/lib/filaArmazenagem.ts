export interface TarefaArmazenagem {
  id: string;
  sku: string;
  nome: string;
  quantidade: number;
  prioridade: string;
  destino: string | null;
}

interface LinhaTarefa {
  id?: unknown;
  prioridade?: unknown;
  quantidade?: unknown;
  produto?: { sku?: unknown; nome?: unknown } | null;
  destino?: { codigo?: unknown } | null;
}

const texto = (valor: unknown): string | null =>
  typeof valor === "string" && valor.trim() !== "" ? valor : null;

/** Converte as linhas de `tarefas` (tipo armazenagem) na fila exibida no putaway. */
export function mapearTarefasArmazenagem(
  linhas: LinhaTarefa[] | null | undefined
): TarefaArmazenagem[] {
  return (linhas ?? []).map((linha) => ({
    id: texto(linha.id) ?? "",
    sku: texto(linha.produto?.sku) ?? "—",
    nome: texto(linha.produto?.nome) ?? "Produto sem cadastro",
    quantidade: typeof linha.quantidade === "number" ? linha.quantidade : 0,
    prioridade: texto(linha.prioridade) ?? "media",
    destino: texto(linha.destino?.codigo),
  }));
}

export interface RegraAlerta {
  tipo: string;
  ativo: boolean;
  threshold_valor: number | null;
  threshold_dias: number | null;
  severidade: string;
}

export interface ProdutoComEstoque {
  id: string;
  sku: string | null;
  nome: string | null;
  estoque_minimo: number | null;
  estoque_maximo: number | null;
  ponto_pedido: number | null;
  estoque_atual: number;
}

export interface AlertaGerado {
  produto_id: string;
  tipo: string;
  severidade: string;
  titulo: string;
  mensagem: string;
  status: "ativo";
  dados_contexto: Record<string, unknown>;
}

const SEVERIDADES = new Set(["info", "aviso", "critico", "urgente"]);

export const SEVERIDADE_PADRAO: Record<string, string> = {
  estoque_minimo: "critico",
  ponto_pedido: "aviso",
  estoque_maximo: "aviso",
};

export function mapaDeRegras(config: RegraAlerta[] | null | undefined): Map<string, RegraAlerta> {
  const mapa = new Map<string, RegraAlerta>();
  for (const regra of config ?? []) {
    if (regra?.tipo) mapa.set(regra.tipo, regra);
  }
  return mapa;
}

// Sem linha em alertas_config a regra continua valendo (comportamento historico); a
// configuracao so desliga ou muda a severidade quando existe.
export function regraAtiva(mapa: Map<string, RegraAlerta>, tipo: string): boolean {
  const regra = mapa.get(tipo);
  return regra ? regra.ativo !== false : true;
}

export function severidadeDe(mapa: Map<string, RegraAlerta>, tipo: string): string {
  const daConfig = mapa.get(tipo)?.severidade;
  if (daConfig && SEVERIDADES.has(daConfig)) return daConfig;
  return SEVERIDADE_PADRAO[tipo] ?? "aviso";
}

export function montarAlertas(
  produtos: ProdutoComEstoque[] | null | undefined,
  config: RegraAlerta[] | null | undefined
): AlertaGerado[] {
  const mapa = mapaDeRegras(config);
  const alertas: AlertaGerado[] = [];

  for (const produto of produtos ?? []) {
    const atual = produto.estoque_atual ?? 0;
    const minimo = produto.estoque_minimo ?? 0;
    const ponto = produto.ponto_pedido ?? 0;
    const maximo = produto.estoque_maximo ?? 0;
    const nome = produto.nome ?? produto.sku ?? produto.id;

    if (minimo > 0 && atual < minimo && regraAtiva(mapa, "estoque_minimo")) {
      alertas.push({
        produto_id: produto.id,
        tipo: "estoque_minimo",
        severidade: severidadeDe(mapa, "estoque_minimo"),
        titulo: `Estoque abaixo do mínimo: ${nome}`,
        mensagem: `${produto.sku}: ${atual} un. (mínimo ${minimo})`,
        status: "ativo",
        dados_contexto: {
          sku: produto.sku,
          estoque_atual: atual,
          estoque_minimo: minimo,
          ponto_pedido: produto.ponto_pedido,
          fonte: "stock-alert",
        },
      });
    }

    if (minimo > 0 && ponto > 0 && atual >= minimo && atual <= ponto && regraAtiva(mapa, "ponto_pedido")) {
      alertas.push({
        produto_id: produto.id,
        tipo: "ponto_pedido",
        severidade: severidadeDe(mapa, "ponto_pedido"),
        titulo: `Ponto de pedido atingido: ${nome}`,
        mensagem: `${produto.sku}: ${atual} un. (ponto de pedido ${ponto})`,
        status: "ativo",
        dados_contexto: {
          sku: produto.sku,
          estoque_atual: atual,
          estoque_minimo: minimo,
          ponto_pedido: ponto,
          fonte: "stock-alert",
        },
      });
    }

    if (maximo > 0 && atual > maximo && regraAtiva(mapa, "estoque_maximo")) {
      alertas.push({
        produto_id: produto.id,
        tipo: "estoque_maximo",
        severidade: severidadeDe(mapa, "estoque_maximo"),
        titulo: `Estoque acima do máximo: ${nome}`,
        mensagem: `${produto.sku}: ${atual} un. (máximo ${maximo})`,
        status: "ativo",
        dados_contexto: {
          sku: produto.sku,
          estoque_atual: atual,
          estoque_maximo: maximo,
          fonte: "stock-alert",
        },
      });
    }
  }

  return alertas;
}

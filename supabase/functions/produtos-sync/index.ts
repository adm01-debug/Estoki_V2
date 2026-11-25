/**
 * Replica o catalogo mestre de produtos (projeto externo de GESTAO DE PRODUTOS)
 * para a tabela `produtos` do WMS.
 *
 * Por que existe: o WMS lia 20.785 SKUs do catalogo mestre que nao existiam aqui
 * (medido em 25/11/2026). O mestre e a fonte; o WMS so replica.
 *
 * Regras:
 * - so escreve colunas de cadastro (sku, nome, descricao, barcode, unidade,
 *   peso, volume, fornecedor). Nunca toca em curva_abc, giro_mensal, estoque_*,
 *   ponto_pedido: isso e gestao do WMS.
 * - o estoque do mestre NAO vem para `produtos`: `produtos` nao tem coluna de
 *   quantidade e o estoque do WMS e `posicoes_estoque`.
 * - paginacao por keyset (updated_at, sku) e cursor persistido em
 *   `produtos_sync_estado`: cada execucao e limitada e retoma de onde parou.
 * - upsert por `sku` (UNIQUE em produtos), idempotente.
 *
 * Chamada: cron (header `x-cron-secret`) ou usuario logado.
 * Corpo: {"modo":"incremental"|"completo","limite":5000}
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { exigirSessaoOuCron } from "../_shared/auth.ts";

const PAGINA_ORIGEM = 500;
const LOTE_DESTINO = 200;
const LIMITE_PADRAO = 5000;
const LIMITE_MAXIMO = 20000;
const NOME_MAXIMO = 300;

const SELECAO =
  "sku,updated_at,color_name,size_code,last_sync_supplier_id," +
  "products(name,description,ean,gtin,deleted_at," +
  "product_physical(weight_g,length_cm,width_cm,height_cm,box_volume_cm3))";

type Fisico = {
  weight_g: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  box_volume_cm3: number | null;
};

type Variante = {
  sku: string | null;
  updated_at: string | null;
  color_name: string | null;
  size_code: string | null;
  last_sync_supplier_id: string | null;
  products: {
    name: string | null;
    description: string | null;
    ean: string | null;
    gtin: string | null;
    deleted_at: string | null;
    product_physical: Fisico | null;
  } | null;
};

type LinhaProduto = {
  sku: string;
  nome: string;
  descricao: string | null;
  barcode: string | null;
  unidade: string;
  peso_unitario: number | null;
  volume_unitario: number | null;
  fornecedor_principal: string | null;
};

type Cursor = { atualizadoAte: string; sku: string } | null;

/** true se `novo` avanca em relacao a `antigo` (por updated_at, depois sku). */
function cursorAvancou(novo: Cursor, antigo: Cursor): boolean {
  if (!novo) return false;
  if (!antigo) return true;
  if (novo.atualizadoAte !== antigo.atualizadoAte) return novo.atualizadoAte > antigo.atualizadoAte;
  return novo.sku > antigo.sku;
}

type AdminDoWms = ReturnType<typeof criarAdmin>;

function criarAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function configuracaoDaOrigem(): { url: string; chave: string } {  const url = (Deno.env.get("SRC_SUPABASE_URL") ?? "").replace(/\/+$/, "");
  const chave = Deno.env.get("SRC_SERVICE_KEY") ?? "";
  if (!url || !chave) {
    throw new Error("SRC_SUPABASE_URL e SRC_SERVICE_KEY precisam existir no ambiente da funcao");
  }
  return { url, chave };
}

function arredondar(valor: number, casas: number): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

/** Acrescenta cor/tamanho ao nome sem repetir o que o nome ja traz. */
function comporNome(base: string, extras: (string | null)[]): string {
  let nome = base.trim();
  for (const extra of extras) {
    const limpo = (extra ?? "").trim();
    if (!limpo) continue;
    if (nome.toLowerCase().includes(limpo.toLowerCase())) continue;
    nome = `${nome} - ${limpo}`;
  }
  return nome.slice(0, NOME_MAXIMO);
}

function calcularVolume(fisico: Fisico | null): number | null {
  if (!fisico) return null;
  const { length_cm, width_cm, height_cm, box_volume_cm3 } = fisico;
  if (length_cm && width_cm && height_cm) {
    return arredondar((length_cm * width_cm * height_cm) / 1_000_000, 6);
  }
  if (box_volume_cm3) return arredondar(box_volume_cm3 / 1_000_000, 6);
  return null;
}

function montarLinha(variante: Variante, fornecedores: Map<string, string>): LinhaProduto | null {
  const produto = variante.products;
  const sku = (variante.sku ?? "").trim();
  if (!produto || !sku) return null;
  if (produto.deleted_at) return null;

  const nomeBase = (produto.name ?? "").trim() || sku;
  const fisico = produto.product_physical ?? null;
  const pesoGramas = fisico?.weight_g ?? null;
  const fornecedorId = variante.last_sync_supplier_id ?? null;

  return {
    sku,
    nome: comporNome(nomeBase, [variante.color_name, variante.size_code]),
    descricao: produto.description ?? null,
    barcode: (produto.ean ?? "").trim() || (produto.gtin ?? "").trim() || null,
    unidade: "UN",
    // produtos.peso_unitario e exibido em kg no app (ProdutosList/ProductGrid)
    peso_unitario: pesoGramas ? arredondar(pesoGramas / 1000, 3) : null,
    // produtos.volume_unitario e DECIMAL(10,6): metro cubico
    volume_unitario: calcularVolume(fisico),
    fornecedor_principal: fornecedorId ? fornecedores.get(fornecedorId) ?? null : null,
  };
}

/**
 * `produtos.barcode` e UNIQUE: dois SKUs do mestre com o mesmo codigo de barras
 * derrubariam o lote inteiro. Em 26/11/2026 o mestre tinha ean/gtin nulos nos
 * 20.785 SKUs, mas a guarda fica para a replicacao nao travar quando passarem a
 * preencher.
 */
async function limparBarcodesEmConflito(
  admin: AdminDoWms,
  lote: LinhaProduto[]
): Promise<number> {
  const codigos = lote.map((l) => l.barcode).filter((b): b is string => !!b);
  if (codigos.length === 0) return 0;

  const vistos = new Set<string>();
  let removidos = 0;
  for (const linha of lote) {
    if (!linha.barcode) continue;
    if (vistos.has(linha.barcode)) {
      linha.barcode = null;
      removidos += 1;
      continue;
    }
    vistos.add(linha.barcode);
  }

  const { data } = await admin.from("produtos").select("sku,barcode").in("barcode", codigos);
  for (const existente of (data ?? []) as { sku: string; barcode: string }[]) {
    for (const linha of lote) {
      if (linha.barcode === existente.barcode && linha.sku !== existente.sku) {
        linha.barcode = null;
        removidos += 1;
      }
    }
  }
  return removidos;
}

async function buscarFornecedores(
  origem: { url: string; chave: string }
): Promise<Map<string, string>> {
  const resposta = await fetch(`${origem.url}/rest/v1/suppliers?select=id,name&limit=1000`, {
    headers: { apikey: origem.chave, Authorization: `Bearer ${origem.chave}` },
  });
  if (!resposta.ok) return new Map();
  const linhas = (await resposta.json()) as { id: string; name: string | null }[];
  return new Map(linhas.filter((l) => l.name).map((l) => [l.id, l.name as string]));
}

async function buscarPagina(
  origem: { url: string; chave: string },
  cursor: Cursor,
  tamanho: number
): Promise<Variante[]> {
  const partes = [
    `select=${SELECAO}`,
    "is_active=eq.true",
    "sku=not.is.null",
    "order=updated_at.asc,sku.asc",
    `limit=${tamanho}`,
  ];
  if (cursor) {
    const data = encodeURIComponent(`"${cursor.atualizadoAte}"`);
    const sku = encodeURIComponent(cursor.sku);
    partes.push(`or=(updated_at.gt.${data},and(updated_at.eq.${data},sku.gt.${sku}))`);
  }
  const resposta = await fetch(`${origem.url}/rest/v1/product_variants?${partes.join("&")}`, {
    headers: { apikey: origem.chave, Authorization: `Bearer ${origem.chave}` },
  });
  if (!resposta.ok) {
    const detalhe = (await resposta.text()).slice(0, 300);
    throw new Error(`origem respondeu ${resposta.status}: ${detalhe}`);
  }
  return (await resposta.json()) as Variante[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  const recusa = await exigirSessaoOuCron(req);
  if (recusa) return recusa;

  const inicio = Date.now();
  const admin = criarAdmin();

  try {
    const corpo = (await req.json().catch(() => ({}))) as { modo?: string; limite?: number };
    const modo = corpo.modo === "completo" ? "completo" : "incremental";
    const limite = Math.min(Math.max(Number(corpo.limite) || LIMITE_PADRAO, 1), LIMITE_MAXIMO);

    const origem = configuracaoDaOrigem();
    const fornecedores = await buscarFornecedores(origem);

    const { data: estado, error: erroEstado } = await admin
      .from("produtos_sync_estado")
      .select("origem_atualizada_ate,origem_sku")
      .eq("id", true)
      .maybeSingle();

    if (erroEstado) {
      throw new Error(
        `produtos_sync_estado indisponivel (migration 20261126130000_CAT_produtos-sync.sql): ${erroEstado.message}`
      );
    }

    const cursorGuardado: Cursor = estado?.origem_atualizada_ate
      ? { atualizadoAte: estado.origem_atualizada_ate as string, sku: estado.origem_sku ?? "" }
      : null;

    let cursor: Cursor = modo === "completo" ? null : cursorGuardado;

    let processados = 0;
    let replicados = 0;
    let ignorados = 0;
    let barcodesDescartados = 0;
    let paginas = 0;
    let ultimoCursor: Cursor = cursor;

    while (processados < limite) {
      const tamanho = Math.min(PAGINA_ORIGEM, limite - processados);
      const variantes = await buscarPagina(origem, cursor, tamanho);
      paginas += 1;
      if (variantes.length === 0) break;

      const linhas: LinhaProduto[] = [];
      for (const variante of variantes) {
        processados += 1;
        const linha = montarLinha(variante, fornecedores);
        if (linha) linhas.push(linha);
        else ignorados += 1;
        if (variante.updated_at) {
          ultimoCursor = { atualizadoAte: variante.updated_at, sku: (variante.sku ?? "").trim() };
        }
      }

      for (let i = 0; i < linhas.length; i += LOTE_DESTINO) {
        const lote = linhas.slice(i, i + LOTE_DESTINO);
        barcodesDescartados += await limparBarcodesEmConflito(admin, lote);
        const { error } = await admin.from("produtos").upsert(lote, { onConflict: "sku" });
        if (error) throw new Error(`upsert em produtos falhou: ${error.message}`);
        replicados += lote.length;
      }

      cursor = ultimoCursor;
      if (variantes.length < tamanho) break;
    }

    const duracao = Date.now() - inicio;
    const resultado = {
      modo,
      paginas,
      processados,
      replicados,
      ignorados,
      barcodes_descartados: barcodesDescartados,
      duracao_ms: duracao,
    };

    // `modo=completo` recomeca do inicio: se parou no limite, o cursor guardado
    // continua sendo o mais avancado.
    const cursorSalvo = cursorAvancou(ultimoCursor, cursorGuardado) ? ultimoCursor : cursorGuardado;

    const { error: erroCursor } = await admin.from("produtos_sync_estado").upsert(
      {
        id: true,
        origem_atualizada_ate: cursorSalvo?.atualizadoAte ?? null,
        origem_sku: cursorSalvo?.sku ?? null,
        ultima_execucao: new Date().toISOString(),
        ultima_duracao_ms: duracao,
        ultimo_resultado: resultado,
      },
      { onConflict: "id" }
    );

    if (erroCursor) {
      throw new Error(`nao gravou o cursor em produtos_sync_estado: ${erroCursor.message}`);
    }

    return new Response(JSON.stringify({ ok: true, ...resultado, cursor: cursorSalvo }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    console.error("produtos-sync:", mensagem);
    return new Response(JSON.stringify({ ok: false, error: mensagem }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
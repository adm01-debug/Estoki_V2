/**
 * Coerencia entre o que o repositorio cita e o que o banco real tem.
 *
 * Duas classes de buraco silencioso, as duas ja vistas neste projeto:
 *
 * - `migrationsOrfas`: o .sql existe em supabase/migrations/ e o objeto que ele cria NAO existe no
 *   banco, ou seja, a migration nunca foi aplicada. O ledger nao serve de prova (carimba versao
 *   diferente do nome do arquivo) e o aplicador so conhece as pendencias escritas a mao em
 *   PENDENCIAS -- migration esquecida fica invisivel para sempre.
 * - `citadosSemBanco`: `.from('tabela')` ou `.rpc('funcao')` no codigo apontando para objeto que o
 *   banco nao tem. Em producao o PostgREST responde PGRST205 (404) e a tela mostra erro.
 *
 * Nada aqui altera o banco: as duas funcoes so leem `supabase/migrations/` e o codigo, e comparam
 * com o inventario medido (`inventario/estado/banco.json`).
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Migrations que criam objeto ausente no banco DE PROPOSITO: escritas por outro agente, nunca
 * aplicadas, e o consumidor tambem nao esta em uso. Aplicar seria pior que ignorar -- `feature_flags`
 * cria policy que referencia a tabela `roles`, que nao existe (a migration falharia no meio), e
 * `entity_versions` libera SELECT para qualquer um alem de expor 3 funcoes SECURITY DEFINER sem
 * search_path. Ficam registradas aqui para nao virarem alerta permanente nem convite a aplicar.
 */
export const MIGRATIONS_OBSOLETAS = {
  '20240115_notifications.sql': 'modelo antigo; o banco usa public.notificacoes',
  '20240115000001_notifications.sql': 'modelo antigo; o banco usa public.notificacoes',
  '20240116_audit_logs.sql': 'modelo antigo; o banco usa public.audit_log',
  '20240115000002_audit_logs.sql': 'modelo antigo; o banco usa public.audit_log',
  '20260512174934_e668fb50-a788-4a81-8f37-6c071e42fb6e.sql': 'modelo antigo; o banco usa public.audit_log',
  '20240117_inventory_count.sql': 'modelo antigo; o banco usa inventario_contagens/inventario_ciclos',
  '20240115000003_inventory_counts.sql': 'modelo antigo; o banco usa inventario_contagens/inventario_ciclos',
  '20251220114813_create_triagens_table.sql': 'modelo antigo; o banco usa public.eventos_triagem',
  '20260516141406_c4b86d53-6670-4edd-87b9-8b6f9750c1fe.sql': 'substituida por public.trigger_xp_triagem_completa',
  '20251220114459_create_recebimentos_table.sql': 'modelo antigo: recebimento real usa nfe_documents/nfe_items/lotes',
  '20240118_stock_reservations.sql': 'feature nunca implementada; so stock-movement (nao deployada) cita a tabela',
  '20240119_import_logs.sql': 'feature nunca implementada; so batch-import (nao deployada) cita a tabela',
  '20241231000001_entity_versions.sql': 'nunca aplicada; VersionHistory nao e importado por nenhuma tela',
  '20251231000002_create_entity_versions_table.sql': 'duplicata mais nova da anterior (mesma tabela, policy com nome igual: falharia)',
  '20251230000002_create_feature_flags_table.sql': 'nunca aplicada; policy cita tabela roles inexistente e src/lib/featureFlags.ts nao e importado',
  '20260519161332_5e98c9d7-a46b-4cbc-810a-515bd8ac62e4.sql': 'funcao validate_ean13 nunca aplicada e sem nenhum consumidor no codigo',
};

/** Tabelas citadas so em codigo morto (componente/edge que nao esta montado nem deployado). */
export const CODIGO_MORTO = {
  entity_versions: 'useVersions/useEntityVersions: nenhuma tela importa VersionHistory',
  feature_flags: 'src/lib/featureFlags.ts: nenhum import; src/config/feature-flags.tsx e a implementacao em uso',
  produtos_estoque: 'EstoqueToolbar: componente nao importado por nenhuma tela',
  recebimentos: 'generate-pdf-report: edge nao publicada',
  stock_reservations: 'stock-movement: edge nao publicada',
  import_logs: 'batch-import: edge nao publicada',
  notifications: 'notifications/stock-movement: edges nao publicadas (a tabela em uso e notificacoes)',
};

const NOMES_DE = (lista) => lista.map((t) => (typeof t === 'string' ? t : t?.nome)).filter(Boolean);

/** Objetos que um arquivo .sql cria, sem interpretar o resto do SQL. */
export function objetosCriados(sql) {
  const tabelas = new Set();
  const funcoes = new Set();
  let views = 0;
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([\w."]+)/gi)) {
    const [schema, nome] = m[1].replaceAll('"', '').includes('.') ? m[1].replaceAll('"', '').split('.') : [null, m[1].replaceAll('"', '')];
    if (!schema || schema === 'public') tabelas.add(nome);
  }
  for (const m of sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-z_0-9]+)/gi)) funcoes.add(m[1]);
  for (const _ of sql.matchAll(/create\s+(?:or\s+replace\s+)?(?:materialized\s+)?view/gi)) views += 1;
  return { tabelas: [...tabelas].sort(), funcoes: [...funcoes].sort(), views };
}

/**
 * Migrations cujo objeto nao existe no banco. `estado` e o inventario medido: `tabelas` (nomes ou
 * objetos com `nome`) e `funcoes` (nomes). Migration que so cria view fica de fora: o inventario nao
 * guarda nome de view, entao nao da para provar ausencia sem inventar evidencia.
 */
export function migrationsOrfas(raiz, estado, obsoletas = MIGRATIONS_OBSOLETAS) {
  const dir = path.join(raiz, 'supabase/migrations');
  if (!fs.existsSync(dir)) return [];
  const tabelas = new Set(NOMES_DE(estado.tabelas ?? []));
  const funcoes = new Set(NOMES_DE(estado.funcoes ?? []));
  const orfas = [];
  for (const arquivo of fs.readdirSync(dir).filter((f) => /^\d+_.*\.sql$/.test(f)).sort()) {
    const criados = objetosCriados(fs.readFileSync(path.join(dir, arquivo), 'utf8'));
    if (criados.views || (!criados.tabelas.length && !criados.funcoes.length)) continue;
    if (criados.tabelas.some((n) => tabelas.has(n)) || criados.funcoes.some((n) => funcoes.has(n))) continue;
    orfas.push({ arquivo, objetos: [...criados.tabelas, ...criados.funcoes], motivo: obsoletas[arquivo] ?? null });
  }
  return orfas;
}

const CITA = /\.from\(\s*['"`]([a-z0-9_]+)['"`]|\.rpc\(\s*['"`]([a-z0-9_]+)['"`]/g;
const CODIGO = /\.(ts|tsx|js|jsx|mjs)$/;

function arquivosEm(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) arquivosEm(caminho, acc);
    else if (CODIGO.test(entrada.name)) acc.push(caminho);
  }
  return acc;
}

/** Arquivos vivos: `src/` (vai pro bundle) + edges publicadas + `_shared` delas. */
function arquivosVivos(raiz, publicadas) {
  const arquivos = arquivosEm(path.join(raiz, 'src'));
  const dir = path.join(raiz, 'supabase/functions');
  if (publicadas?.length) {
    for (const slug of [...publicadas, '_shared']) arquivos.push(...arquivosEm(path.join(dir, slug)));
  }
  return arquivos;
}

/** Tabelas e RPCs citados no codigo vivo (`.from()` de storage nao conta). */
export function citadosNoCodigo(raiz, publicadas = []) {
  const citados = new Map();
  for (const arquivo of arquivosVivos(raiz, publicadas)) {
    const rel = path.relative(raiz, arquivo).split(path.sep).join('/');
    const texto = fs.readFileSync(arquivo, 'utf8');
    for (const m of texto.matchAll(CITA)) {
      const nome = m[1] ?? m[2];
      const antes = texto.slice(Math.max(0, m.index - 40), m.index).replace(/\s+/g, ' ');
      if (m[1] && /storage\s*\.?$/.test(antes)) continue;
      const tipo = m[1] ? 'tabela' : 'rpc';
      const chave = `${tipo}:${nome}`;
      if (!citados.has(chave)) citados.set(chave, { nome, tipo, arquivos: [] });
      const alvo = citados.get(chave);
      if (!alvo.arquivos.includes(rel)) alvo.arquivos.push(rel);
    }
  }
  return [...citados.values()].sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Citados no codigo vivo que o banco real nao tem. `mortos` explica os ja conhecidos (codigo morto);
 * o que sobra sem motivo e codigo em producao apontando para objeto inexistente -- falha de verdade.
 */
export function citadosSemBanco(raiz, estado, mortos = CODIGO_MORTO) {
  const tabelas = new Set(NOMES_DE(estado.tabelas ?? []));
  const funcoes = new Set(NOMES_DE(estado.funcoes ?? []));
  const publicadas = (estado.edge_functions?.publicadas ?? []).map((f) => f.slug);
  return citadosNoCodigo(raiz, publicadas)
    .filter((c) => (c.tipo === 'tabela' ? !tabelas.has(c.nome) : !funcoes.has(c.nome)))
    .map((c) => ({ ...c, motivo: mortos[c.nome] ?? null }));
}
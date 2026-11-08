#!/usr/bin/env node
/**
 * Inventario das rotas do front -> inventario/estado/rotas.json (fonte de consulta dos agentes).
 *
 * Le o codigo, nao documentacao:
 *  - URLs:  src/App.tsx + src/routes/*.tsx (path, pagina, ProtectedRoute/requiredRoles/requiredPermission, Navigate)
 *  - Menu:  src/config/menu.ts (menuItems: rotulo + path)
 *  - Telas: a pagina de cada URL que resolve para um arquivo do repo
 *  - Para cada tela: segue os imports a partir do arquivo da tela (mesma pasta de feature,
 *    src/hooks/ e src/services/) e lista hooks, edge functions invocadas, RPCs, tabelas (.from e
 *    /rest/v1) e buckets de storage (storage.from).
 *  - `problemas`: item de menu sem rota, URL sem arquivo e import local que nao resolve.
 *
 * Uso:
 *   node scripts/inventario/gerar-rotas.mjs           grava inventario/estado/rotas.json
 *   node scripts/inventario/gerar-rotas.mjs --check   exit 1 se o arquivo commitado esta desatualizado
 * Saida deterministica (sem data): o mesmo codigo gera o mesmo arquivo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ_PADRAO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA_REL = 'inventario/estado/rotas.json';
const EXTENSOES = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];
// Wrappers de rota: nunca sao a pagina da URL.
const IGNORAR_NO_ELEMENT = ['ProtectedRoute', 'Navigate', 'Route', 'Routes', 'Suspense', 'ErrorBoundary',
  'RouteErrorBoundary', 'RouteLoadingFallback', 'LoadingFallback', 'AppLayout', 'Outlet', 'Fragment'];

const ler = (raiz, rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');
const rel = (raiz, abs) => path.relative(raiz, abs).split(path.sep).join('/');
const unico = (lista) => [...new Set(lista)].sort();

/** Resolve um especificador de import para um arquivo do repo (ou null se externo/inexistente). */
export function resolverImport(raiz, deArquivoAbs, especificador) {
  let base;
  if (especificador.startsWith('@/')) base = path.join(raiz, 'src', especificador.slice(2));
  else if (especificador.startsWith('.')) base = path.resolve(path.dirname(deArquivoAbs), especificador);
  else return null;
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const ext of EXTENSOES) if (fs.existsSync(base + ext)) return base + ext;
  return undefined; // local, mas nao existe
}

/** Imports de um arquivo: [{ especificador, nomes[] }] (estaticos e import() dinamico). */
export function extrairImports(texto) {
  const out = [];
  for (const m of texto.matchAll(/import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
    if (m[1]) continue;
    const nomes = [...m[2].matchAll(/\b([A-Za-z_$][\w$]*)\b(?!\s*as\b)/g)].map((x) => x[1])
      .filter((n) => !['type', 'as', 'default'].includes(n));
    out.push({ especificador: m[3], nomes });
  }
  for (const m of texto.matchAll(/(?:import|export)\s*(?:\*\s*from\s*)?['"]([^'"]+)['"]/g)) out.push({ especificador: m[1], nomes: [] });
  for (const m of texto.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push({ especificador: m[1], nomes: [] });
  for (const m of texto.matchAll(/export\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g)) out.push({ especificador: m[1], nomes: [] });
  return out;
}

/**
 * Mapa nome -> valor dos `const NOME = 'literal'` (ou `export const`) de nivel de modulo no texto.
 * So resolve o caso mais comum do repo: identificador passado direto pra `.from`/`fromTable`/
 * `storage.from`/`rpc`/`invoke` que e, no mesmo arquivo, uma constante de string (ex.:
 * `TALKX_MEDIA_BUCKET`, `ACL_ALERTS_TABLE`). Nao resolve parametro de funcao nem ternario.
 * Coluna zero sozinha nao basta (achado do Qodo na revisao desta correcao): um `const` dentro
 * de funcao tambem pode estar em coluna zero se o arquivo nao passou pelo Prettier (o repo nao
 * tem `prettier --check` no CI). Por isso conta profundidade de `{`/`}` linha a linha e so
 * aceita o `const` quando a profundidade, ANTES de processar a linha, e zero (nivel de modulo
 * de verdade). Contagem ingenua (nao ignora chave dentro de string/template) e de proposito:
 * na duvida, prefere nao resolver a resolver errado.
 */
function constantesDeString(texto) {
  const mapa = new Map();
  let profundidade = 0;
  for (const linha of texto.split('\n')) {
    if (profundidade === 0) {
      const m = linha.match(/^(?:export\s+)?const\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[^=]+)?=\s*['"`]([A-Za-z0-9_.-]+)['"`]\s*[;,]?\s*$/);
      if (m) mapa.set(m[1], m[2]);
    }
    for (const ch of linha) {
      if (ch === '{') profundidade++;
      else if (ch === '}') profundidade--;
    }
  }
  return mapa;
}

/**
 * Chamadas ao Supabase num texto: tabelas (`.from` do cliente, `fromTable` de
 * src/lib/supabaseHelpers.ts e `/rest/v1/<tabela>`), buckets (`storage.from`), RPCs (`.rpc`) e
 * edges (`functions.invoke`, `invokeEdge`, `/functions/v1/<edge>`).
 */
export function extrairChamadas(texto) {
  const pegar = (re) => [...texto.matchAll(re)].map((m) => m[1]);
  const consts = constantesDeString(texto);
  const tabelas = [];
  const buckets = [];
  for (const m of texto.matchAll(/(\bstorage\s*)?\.from\(\s*['"`]([A-Za-z0-9_-]+)['"`]/g)) (m[1] ? buckets : tabelas).push(m[2]);
  for (const m of texto.matchAll(/(\bstorage\s*)?\.from\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g)) {
    if (consts.has(m[2])) (m[1] ? buckets : tabelas).push(consts.get(m[2]));
  }
  // `fromTable('x')` / `fromTable(CONST)` — atalho tipado de src/lib/supabaseHelpers.ts, sempre tabela.
  for (const m of texto.matchAll(/\bfromTable\(\s*['"`]([A-Za-z0-9_-]+)['"`]/g)) tabelas.push(m[1]);
  for (const m of texto.matchAll(/\bfromTable\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g)) {
    if (consts.has(m[1])) tabelas.push(consts.get(m[1]));
  }
  tabelas.push(...pegar(/\/rest\/v1\/([A-Za-z0-9_]+)/g).filter((t) => t !== 'rpc'));
  return {
    tabelas,
    buckets,
    // `.rpc('x')` e o apelido `const rpc = supabase.rpc.bind(...)` + `rpc('x')`.
    rpcs: [...pegar(/(?:\.|\b)rpc\(\s*['"`]([A-Za-z0-9_]+)['"`]/g), ...pegar(/\/rest\/v1\/rpc\/([A-Za-z0-9_]+)/g)],
    // `functions.invoke` (inclusive quebrado em linha) e o atalho `invokeEdge<T>(...)` de
    // src/lib/invokeEdge.ts; `invoke('evolution-api/connect')` conta como a edge `evolution-api`.
    // `fetch(`${SUPABASE_URL}/functions/v1/get-call-recording`)` (chamada direta pela URL): so dentro
    // de string/template; a URL mostrada como texto em JSX (ex.: GmailWebhookMonitor) nao e chamada.
    edges: [
      ...pegar(/(?:functions\s*\.\s*invoke|\binvokeEdge)(?:<[^>()]*>)?\(\s*['"`]([A-Za-z0-9_-]+)(?:\/[^'"`]*)?['"`]/g),
      ...pegar(/['"`][^'"`\n]*\/functions\/v1\/([A-Za-z0-9_-]+)/g),
    ],
  };
}

const ehTeste = (p) => /(\.test\.|\.spec\.|__tests__|\.stories\.)/.test(p);

/**
 * Fecho de imports a partir do arquivo da tela. Segue sem limite a pasta da feature da tela,
 * src/hooks/, src/services/, src/lib/ e src/features/ (helpers que chamam edge/RPC, ex.:
 * callCRMIntegration, mapboxToken); componentes de OUTRA feature em src/components/ (ex.: a aba
 * Filas da Supervisão renderiza QueuesView) entram ate MAX_SALTOS_FEATURE saltos. Fica de fora
 * so o kit de UI (src/components/ui/) e teste. Import local que nao resolve vira problema.
 */
export const MAX_SALTOS_FEATURE = 2;
export function fechoDaTela(raiz, arquivoTelaAbs) {
  const pastaFeature = path.dirname(arquivoTelaAbs);
  const dentro = (abs, rel_) => abs.startsWith(path.join(raiz, rel_) + path.sep);
  const livre = (abs) => abs.startsWith(pastaFeature + path.sep) || ['src/hooks', 'src/services', 'src/lib', 'src/features'].some((d) => dentro(abs, d));
  const outraFeature = (abs) => dentro(abs, 'src/components') && !dentro(abs, 'src/components/ui');
  const saltosVistos = new Map(); // arquivo -> menor numero de saltos com que foi visitado
  const hooks = new Map();
  const quebrados = new Set();
  const chamadas = { tabelas: [], buckets: [], rpcs: [], edges: [] };
  const fila = [[arquivoTelaAbs, 0]];
  while (fila.length) {
    const [atual, saltos] = fila.shift();
    if (saltosVistos.has(atual) && saltosVistos.get(atual) <= saltos) continue;
    const primeiraVez = !saltosVistos.has(atual);
    saltosVistos.set(atual, saltos);
    const texto = fs.readFileSync(atual, 'utf8');
    if (primeiraVez) {
      const c = extrairChamadas(texto);
      for (const k of Object.keys(chamadas)) chamadas[k].push(...c[k]);
    }
    for (const imp of extrairImports(texto)) {
      const alvo = resolverImport(raiz, atual, imp.especificador);
      if (alvo === undefined && !/\.(css|scss|svg|png|jpe?g|webp|gif|json)(\?.*)?$|\?/.test(imp.especificador)) {
        quebrados.add(`${rel(raiz, atual)} -> ${imp.especificador}`);
      }
      if (!alvo || ehTeste(alvo)) continue;
      for (const nome of imp.nomes) if (/^use[A-Z]/.test(nome) && !hooks.has(nome)) hooks.set(nome, rel(raiz, alvo));
      if (livre(alvo)) fila.push([alvo, saltos]);
      else if (outraFeature(alvo) && saltos < MAX_SALTOS_FEATURE) fila.push([alvo, saltos + 1]);
    }
  }
  return {
    arquivos_lidos: saltosVistos.size,
    hooks: [...hooks.entries()].map(([nome, arquivo]) => ({ nome, arquivo })).sort((a, b) => a.nome.localeCompare(b.nome)),
    buckets: unico(chamadas.buckets),
    edges: unico(chamadas.edges),
    rpcs: unico(chamadas.rpcs),
    tabelas: unico(chamadas.tabelas),
    imports_quebrados: [...quebrados].sort(),
  };
}

/** URLs do react-router: src/App.tsx + src/routes/*.tsx (um arquivo por grupo de rotas). */
export function lerUrls(raiz) {
  const arquivos = ['src/App.tsx', ...(fs.existsSync(path.join(raiz, 'src/routes'))
    ? fs.readdirSync(path.join(raiz, 'src/routes')).filter((f) => /\.(t|j)sx?$/.test(f) && !ehTeste(f)).sort().map((f) => `src/routes/${f}`)
    : [])].filter((rel_) => fs.existsSync(path.join(raiz, rel_)));
  const urls = [];
  for (const arquivo of arquivos) {
    const texto = ler(raiz, arquivo);
    const abs = path.join(raiz, arquivo);
    // Nomes de componente podem ter acento (ex.: EndereçamentoAutomatico): \w nao cobre, \p{L} com flag u cobre.
    const lazy = Object.fromEntries([...texto.matchAll(/const\s+([A-Za-z_$][\p{L}\p{N}_$]*)\s*=\s*lazy\w*\(\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/gu)]
      .map((m) => [m[1], m[2]]));
    for (const pedaco of texto.split(/<Route\b/).slice(1)) {
      const bruto = (pedaco.match(/path(?:=|:\s*)["']([^"']*)["']/) || [])[1];
      if (bruto === undefined) continue;
      const caminho = bruto === '' ? '/' : (bruto.startsWith('/') ? bruto : `/${bruto}`);
      const redireciona = (pedaco.match(/<Navigate\s+to=["']([^"']+)["']/) || [])[1] ?? null;
      const componente = [...pedaco.matchAll(/<([A-Z][\p{L}\p{N}_$]*)/gu)].map((m) => m[1])
        .find((n) => !IGNORAR_NO_ELEMENT.includes(n)) ?? null;
      const papeis = ((pedaco.match(/requiredRoles=\{\[([^\]]*)\]\}/) || [])[1] || '')
        .match(/['"]([^'"]+)['"]/g)?.map((t) => t.slice(1, -1)) ?? [];
      const permissao = (pedaco.match(/requiredPermission=\{?["']([^"']+)["']/) || [])[1] ?? null;
      const esp = componente ? lazy[componente] : null;
      const alvo = esp ? resolverImport(raiz, abs, esp) : null;
      urls.push({
        caminho,
        componente,
        arquivo: alvo ? rel(raiz, alvo) : null,
        declarada_em: arquivo,
        protegida: pedaco.includes('<ProtectedRoute'),
        papeis,
        permissao,
        redireciona,
      });
    }
  }
  return urls.sort((a, b) => a.caminho.localeCompare(b.caminho) || a.declarada_em.localeCompare(b.declarada_em));
}

/** Itens de menu de src/config/menu.ts: path -> { rotulo }. */
export function lerMenu(raiz) {
  const arquivo = 'src/config/menu.ts';
  if (!fs.existsSync(path.join(raiz, arquivo))) return {};
  const texto = ler(raiz, arquivo);
  const menu = {};
  for (const m of texto.matchAll(/\{\s*name:\s*["']([^"']+)["']\s*,\s*path:\s*["']([^"']+)["']([^}]*)\}/g)) {
    menu[m[2]] = { rotulo: m[1], icone: (m[3].match(/icon:\s*(\w+)/) || [])[1] ?? null };
  }
  return menu;
}

/** Monta o inventario inteiro a partir de uma raiz de repo. */
export function gerarRotas(raiz = RAIZ_PADRAO) {
  const urls = lerUrls(raiz);
  const menu = lerMenu(raiz);
  const caminhosUrl = new Set(urls.map((u) => u.caminho));

  const telas = urls.filter((u) => u.arquivo).map((u) => ({
    id: u.caminho,
    url: u.caminho,
    componente: u.componente,
    arquivo: u.arquivo,
    declarada_em: u.declarada_em,
    protegida: u.protegida,
    papeis: u.papeis,
    permissao: u.permissao,
    menu: menu[u.caminho] ?? null,
    ...fechoDaTela(raiz, path.join(raiz, u.arquivo)),
  })).sort((a, b) => a.id.localeCompare(b.id) || String(a.componente).localeCompare(String(b.componente)));

  const hooks = {};
  for (const t of telas) for (const h of t.hooks) {
    hooks[h.nome] ??= { arquivo: h.arquivo, telas: [] };
    hooks[h.nome].telas.push(t.id);
  }

  const problemas = [
    ...Object.keys(menu).filter((caminho) => !caminhosUrl.has(caminho)).sort()
      .map((caminho) => ({ tipo: 'menu_sem_rota', id: caminho, detalhe: `item "${menu[caminho].rotulo}" do menu sem <Route> correspondente` })),
    ...urls.filter((u) => u.componente && !u.arquivo && !u.redireciona)
      .map((u) => ({ tipo: 'url_sem_arquivo', id: u.caminho, detalhe: `${u.componente} nao resolve para um arquivo a partir de ${u.declarada_em}` })),
    ...telas.flatMap((t) => t.imports_quebrados.map((q) => ({ tipo: 'import_quebrado', id: t.id, detalhe: q }))),
  ];

  return {
    format_version: 1,
    fonte: 'scripts/inventario/gerar-rotas.mjs (le src/App.tsx, src/routes/*.tsx, src/config/menu.ts e os imports de cada pagina)',
    resumo: {
      urls: urls.length,
      telas: telas.length,
      itens_de_menu: Object.keys(menu).length,
      hooks_distintos: Object.keys(hooks).length,
      problemas: problemas.length,
    },
    urls,
    telas,
    hooks: Object.fromEntries(Object.keys(hooks).sort().map((k) => [k, { arquivo: hooks[k].arquivo, telas: unico(hooks[k].telas) }])),
    problemas,
  };
}

export const serializar = (inv) => JSON.stringify(inv, null, 2) + '\n';

function main(argv) {
  const saida = path.join(RAIZ_PADRAO, SAIDA_REL);
  const conteudo = serializar(gerarRotas(RAIZ_PADRAO));
  if (argv.includes('--check')) {
    const atual = fs.existsSync(saida) ? fs.readFileSync(saida, 'utf8') : '';
    if (atual !== conteudo) {
      console.error(`${SAIDA_REL} desatualizado: rode node scripts/inventario/gerar-rotas.mjs e commite o resultado.`);
      process.exit(1);
    }
    console.log(`${SAIDA_REL} em dia.`);
    return;
  }
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, conteudo);
  const r = JSON.parse(conteudo).resumo;
  console.log(`rotas.json: ${r.urls} URLs, ${r.telas} telas, ${r.itens_de_menu} itens de menu, ${r.hooks_distintos} hooks, ${r.problemas} problemas.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));

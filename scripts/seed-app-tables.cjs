require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = process.env.SERVICE_ROLE_KEY;
if (!serviceRoleKey) { console.error('SERVICE_ROLE_KEY nao definida'); process.exit(1); }

const sb = createClient(process.env.VITE_SUPABASE_URL, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

(async () => {
  let ok = 0, fail = 0;

  // 1. PRODUTOS
  const produtos = [
    { sku: 'BRINDE-001', nome: 'Caneca Personalizada 350ml', unidade: 'UN', curva_abc: 'A', giro_mensal: 120, estoque_minimo: 50, ponto_pedido: 100 },
    { sku: 'BRINDE-002', nome: 'Camiseta Estampada Algodao M', unidade: 'UN', curva_abc: 'A', giro_mensal: 80, estoque_minimo: 30, ponto_pedido: 60 },
    { sku: 'BRINDE-003', nome: 'Camiseta Estampada Algodao G', unidade: 'UN', curva_abc: 'A', giro_mensal: 75, estoque_minimo: 30, ponto_pedido: 60 },
    { sku: 'BRINDE-004', nome: 'Bone 6 Bossas Personalizado', unidade: 'UN', curva_abc: 'B', giro_mensal: 60, estoque_minimo: 25, ponto_pedido: 50 },
    { sku: 'BRINDE-005', nome: 'Chaveiro Metal Promocional', unidade: 'UN', curva_abc: 'B', giro_mensal: 200, estoque_minimo: 80, ponto_pedido: 150 },
    { sku: 'BRINDE-006', nome: 'Bolsa Termica 12L Executiva', unidade: 'UN', curva_abc: 'B', giro_mensal: 40, estoque_minimo: 15, ponto_pedido: 30 },
    { sku: 'BRINDE-007', nome: 'Pen Drive 16GB Customizado', unidade: 'UN', curva_abc: 'C', giro_mensal: 25, estoque_minimo: 10, ponto_pedido: 20 },
    { sku: 'BRINDE-008', nome: 'Copo Termico Inox 500ml', unidade: 'UN', curva_abc: 'A', giro_mensal: 90, estoque_minimo: 35, ponto_pedido: 70 },
    { sku: 'BRINDE-009', nome: 'Squeeze Aluminio 750ml', unidade: 'UN', curva_abc: 'B', giro_mensal: 55, estoque_minimo: 20, ponto_pedido: 45 },
    { sku: 'BRINDE-010', nome: 'Caderno A5 Corporativo', unidade: 'UN', curva_abc: 'B', giro_mensal: 45, estoque_minimo: 20, ponto_pedido: 40 },
    { sku: 'BRINDE-011', nome: 'Power Bank 10000mAh', unidade: 'UN', curva_abc: 'C', giro_mensal: 15, estoque_minimo: 5, ponto_pedido: 15 },
    { sku: 'BRINDE-012', nome: 'Carteira Couro Sintetico', unidade: 'UN', curva_abc: 'C', giro_mensal: 20, estoque_minimo: 8, ponto_pedido: 18 },
    { sku: 'BRINDE-013', nome: 'Mochila Notebook 15.6"', unidade: 'UN', curva_abc: 'A', giro_mensal: 12, estoque_minimo: 5, ponto_pedido: 10 },
    { sku: 'BRINDE-014', nome: 'Guarda-Chuva Compacto', unidade: 'UN', curva_abc: 'C', giro_mensal: 30, estoque_minimo: 12, ponto_pedido: 25 },
    { sku: 'BRINDE-015', nome: 'Kit Escritorio (Bloco+Caneta)', unidade: 'CX', curva_abc: 'B', giro_mensal: 70, estoque_minimo: 25, ponto_pedido: 50 },
  ];

  for (const p of produtos) {
    const { error } = await sb.from('produtos').upsert(p, { onConflict: 'sku' });
    if (error) { console.log('PRODUTO', p.sku, ':', error.message); fail++; } else ok++;
  }
  console.log('produtos OK:', ok, 'FAIL:', fail);
  ok = 0; fail = 0;

  // 2. LOTES
  const { data: produtosDb } = await sb.from('produtos').select('id, sku');
  const prodMap = {};
  produtosDb?.forEach(p => prodMap[p.sku] = p.id);

  const hoje = new Date();
  const fmt = d => d.toISOString();
  const addDias = (d, n) => new Date(d.getTime() + n * 86400000);

  const lotes = [
    { numero_lote: 'LOTE-2026-001', sku: 'BRINDE-001', quantidade_inicial: 500, quantidade_atual: 380, status: 'em_transito', fornecedor: 'Fornecedor Brindes LTDA', nf_entrada: 'NF-10001', previsao_chegada: fmt(addDias(hoje, 1)) },
    { numero_lote: 'LOTE-2026-002', sku: 'BRINDE-002', quantidade_inicial: 200, quantidade_atual: 200, status: 'aguardando', fornecedor: 'Artigos Promocionais ABC', nf_entrada: 'NF-10002', previsao_chegada: fmt(addDias(hoje, 2)) },
    { numero_lote: 'LOTE-2026-003', sku: 'BRINDE-003', quantidade_inicial: 150, quantidade_atual: 150, status: 'em_transito', fornecedor: 'Distribuidora Brasil', nf_entrada: 'NF-10003', previsao_chegada: fmt(addDias(hoje, 3)) },
    { numero_lote: 'LOTE-2026-004', sku: 'BRINDE-004', quantidade_inicial: 300, quantidade_atual: 300, status: 'aguardando', fornecedor: 'Fornecedor Brindes LTDA', nf_entrada: 'NF-10004', previsao_chegada: fmt(addDias(hoje, 4)) },
    { numero_lote: 'LOTE-2026-005', sku: 'BRINDE-005', quantidade_inicial: 1000, quantidade_atual: 750, status: 'recebido', fornecedor: 'Importadora Express', nf_entrada: 'NF-10005', previsao_chegada: fmt(addDias(hoje, -2)) },
    { numero_lote: 'LOTE-2026-006', sku: 'BRINDE-006', quantidade_inicial: 150, quantidade_atual: 150, status: 'recebido', fornecedor: 'Creative Gifts', nf_entrada: 'NF-10006', previsao_chegada: fmt(addDias(hoje, -5)) },
    { numero_lote: 'LOTE-2026-007', sku: 'BRINDE-007', quantidade_inicial: 75, quantidade_atual: 75, status: 'recebido', fornecedor: 'Brindes Premium', nf_entrada: 'NF-10007', previsao_chegada: fmt(addDias(hoje, -1)) },
    { numero_lote: 'LOTE-2026-008', sku: 'BRINDE-008', quantidade_inicial: 400, quantidade_atual: 400, status: 'recebido', fornecedor: 'Fornecedor Brindes LTDA', nf_entrada: 'NF-10008', previsao_chegada: fmt(addDias(hoje, -1)) },
    { numero_lote: 'LOTE-2026-009', sku: 'BRINDE-009', quantidade_inicial: 250, quantidade_atual: 250, status: 'aguardando', fornecedor: 'Distribuidora Brasil', nf_entrada: 'NF-10009', previsao_chegada: fmt(addDias(hoje, 5)) },
    { numero_lote: 'LOTE-2026-010', sku: 'BRINDE-010', quantidade_inicial: 180, quantidade_atual: 180, status: 'divergencia', fornecedor: 'Creative Gifts', nf_entrada: 'NF-10010', previsao_chegada: fmt(addDias(hoje, -3)) },
    { numero_lote: 'LOTE-2026-011', sku: 'BRINDE-011', quantidade_inicial: 60, quantidade_atual: 60, status: 'divergencia', fornecedor: 'Importadora Express', nf_entrada: 'NF-10011', previsao_chegada: fmt(addDias(hoje, -2)) },
    { numero_lote: 'LOTE-2026-012', sku: 'BRINDE-012', quantidade_inicial: 90, quantidade_atual: 90, status: 'recebido', fornecedor: 'Brindes Premium', nf_entrada: 'NF-10012', previsao_chegada: fmt(addDias(hoje, -7)) },
  ];

  const lotesInseridos = [];
  for (const l of lotes) {
    if (!prodMap[l.sku]) continue;
    const payload = {
      numero_lote: l.numero_lote,
      produto_id: prodMap[l.sku],
      quantidade_inicial: l.quantidade_inicial,
      quantidade_atual: l.quantidade_atual,
      status: l.status,
      fornecedor: l.fornecedor,
      nf_entrada: l.nf_entrada,
      previsao_chegada: l.previsao_chegada,
    };
    const { data, error } = await sb.from('lotes').insert(payload).select().single();
    if (error) { console.log('LOTE', l.numero_lote, ':', error.message); fail++; }
    else { ok++; lotesInseridos.push(data); }
  }
  console.log('lotes OK:', ok, 'FAIL:', fail);
  ok = 0; fail = 0;

  // 3. ATUALIZAR STATUS DE ALGUMAS POSICOES PARA OCUPADO
  const { data: posicoes } = await sb.from('posicoes_estoque').select('id, codigo, status').eq('status', 'livre').limit(40);
  for (const p of posicoes || []) {
    const { error } = await sb.from('posicoes_estoque').update({ status: 'ocupado' }).eq('id', p.id);
    if (error) fail++; else ok++;
  }
  console.log('posicoes->ocupado OK:', ok, 'FAIL:', fail);
  ok = 0; fail = 0;

  // 4. ESTOQUE_POSICAO (vincular saldos aos lotes recebidos)
  const { data: posicoesOcupadas } = await sb.from('posicoes_estoque').select('id, codigo').eq('status', 'ocupado').limit(12);
  const lotesRecebidos = lotesInseridos.filter(l => l.status === 'recebido');

  let idxPos = 0;
  for (const lote of lotesRecebidos) {
    if (idxPos >= (posicoesOcupadas?.length || 0)) break;
    const pos = posicoesOcupadas[idxPos];
    const { error } = await sb.from('estoque_posicao').insert({
      produto_id: lote.produto_id,
      lote_id: lote.id,
      posicao_id: pos.id,
      quantidade: lote.quantidade_atual,
      data_entrada: new Date().toISOString(),
    });
    if (error) { console.log('ESTOQUE', lote.numero_lote, '->', pos.codigo, ':', error.message); fail++; }
    else ok++;
    idxPos++;
  }
  console.log('estoque_posicao OK:', ok, 'FAIL:', fail);

  console.log('\n=== RESUMO FINAL ===');
  for (const t of ['produtos', 'lotes', 'posicoes_estoque', 'estoque_posicao']) {
    const { count } = await sb.from(t).select('*', { count: 'exact', head: true });
    console.log(t.padEnd(20), '=>', count);
  }
})();

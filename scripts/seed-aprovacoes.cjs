require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function insert(table, records) {
  if (!records.length) return;
  const { error } = await sb.from(table).insert(records);
  if (error) console.log(`${table}: ${error.message}`);
  else console.log(`${table}: ${records.length} OK`);
}

(async () => {
  await sb.from('aprovacoes_movimentacao').delete().gte('created_at', '1900-01-01');

  const prods = (await sb.from('produtos').select('id, nome')).data || [];
  const lotes = (await sb.from('lotes').select('id, numero_lote')).data || [];
  const pos = (await sb.from('posicoes_estoque').select('id, codigo')).data || [];
  const users = (await sb.from('profiles').select('id, nome')).data || [];
  if (prods.length === 0 || users.length === 0) { console.log('Sem produtos/users'); return; }
  const sol = users[0]?.id;
  const apr = users[1]?.id || sol;

  const tipos = ['ajuste_estoque', 'transferencia', 'descarte', 'quebra_estoque', 'entrada_manual', 'saida_emergencial'];
  const statusCycle = ['pendente', 'pendente', 'pendente', 'em_analise', 'em_analise', 'aprovada', 'aprovada', 'rejeitada', 'cancelada'];
  const motivos = [
    'Ajuste de inventário cíclico - diferença de 8 un.',
    'Transferência entre filiais - rebalanceamento de estoque.',
    'Descarte por avaria - produto molhado durante armazenamento.',
    'Quebra detectada no inventário rotativo.',
    'Entrada manual de bonificação de fornecedor.',
    'Saída emergencial para cliente VIP - pedido não previsto.',
    'Correção de erro de cadastro de estoque inicial.',
    'Devolução ao fornecedor por lote fora de especificação.',
    'Reclassificação contábil de mercadoria obsoleta.',
  ];
  const obs = [
    'Documentação anexada. Fotos da avaria disponíveis.',
    'Aguardando aprovação do gerente para prosseguir.',
    'Conferência física realizada. Divergência confirmada.',
    'Solicitação urgente - cliente com prazo curto.',
    'Procedimento padrão de ajuste - já validado em inventário.',
    'Requer aprovação de dois níveis conforme política.',
    null,
    'Lote fora de especificação técnica. Anexar laudo.',
    null,
  ];

  const records = [];
  const now = Date.now();
  for (let i = 0; i < 25; i++) {
    const prod = prods[i % prods.length];
    const lote = lotes[i % lotes.length];
    const posicao = pos[i % pos.length];
    const tipo = tipos[i % tipos.length];
    const status = statusCycle[i % statusCycle.length];
    const motivo = motivos[i % motivos.length];
    const qty = 5 + (i % 10) * 5;
    const solData = new Date(now - (i * 3600 * 1000 * 2)).toISOString();
    const decisao = ['aprovada','rejeitada'].includes(status) ? new Date(now - (i * 3600 * 1000)).toISOString() : null;
    const observacao = obs[i % obs.length];
    const aprUser = status === 'pendente' ? null : apr;
    records.push({
      tipo,
      produto_id: prod.id,
      lote_id: lote?.id,
      posicao_id: posicao?.id,
      quantidade: qty,
      motivo,
      solicitante_id: sol,
      aprovador_id: aprUser,
      status,
      data_solicitacao: solData,
      data_decisao: decisao,
      observacao_aprovador: observacao,
    });
  }
  await insert('aprovacoes_movimentacao', records);

  console.log('=== Concluído ===');
})();
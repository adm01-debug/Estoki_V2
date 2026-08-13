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
  await sb.from('inspecoes_qualidade').delete().gte('created_at', '1900-01-01');

  const lotes = (await sb.from('lotes').select('id, numero_lote')).data || [];
  const users = (await sb.from('profiles').select('id, nome')).data || [];
  if (lotes.length === 0) { console.log('Sem lotes — abortando'); return; }
  const insp = users[0]?.id;

  const resultados = ['aprovado', 'aprovado', 'aprovado', 'aprovado', 'condicional', 'condicional', 'rejeitado'];
  const observacoes = [
    'Embalagem íntegra, sem avarias. Produto conforme especificação.',
    'Etiquetas posicionadas corretamente. Sem defeitos visuais.',
    'Cor e dimensões dentro do padrão. Lote aprovado para expedição.',
    'Pequeno desvio dimensional, dentro da tolerância permitida.',
    'Impressão levemente deslocada. Aprovado com observação.',
    'Embalagem secundária amassada. Solicitar troca na próxima remessa.',
    'Cor fora do padrão Pantone. Rejeitado - retorno ao fornecedor.',
    'Produto com manchas. Bloqueio de qualidade acionado.',
    'Aprovação parcial - 80% conforme. Liberado sob condição.',
    'Verificação de amostragem concluída. Sem não-conformidades.',
  ];

  const records = [];
  const now = Date.now();
  for (let i = 0; i < 25; i++) {
    const lote = lotes[i % lotes.length];
    const resultado = resultados[i % resultados.length];
    const obs = observacoes[i % observacoes.length];
    const pontuacao = resultado === 'aprovado' ? 8 + (i % 3) : resultado === 'condicional' ? 5 + (i % 2) : 2 + (i % 2);
    const offset = new Date(now - (i * 3600 * 1000 * 2)).toISOString();
    records.push({
      lote_id: lote.id,
      inspecionado_por: insp,
      resultado,
      pontuacao,
      observacoes: obs,
      created_at: offset,
    });
  }
  await insert('inspecoes_qualidade', records);

  console.log('=== Concluído ===');
})();
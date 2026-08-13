require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

(async () => {
  // descobrir schema real via tentativa de insert e observação do erro
  // ou via select com limit
  const tabelas = [
    'alertas_config', 'rastreamento_historico', 'orders', 'romaneios',
    'ondas_separacao', 'tarefas', 'checkpoints_zona', 'custodia_transferencias',
    'ocorrencias_perda', 'conquistas_definicoes', 'relatorios_agendados',
    'inventario_ciclos', 'ajustes_estoque', 'audit_log', 'login_logs', 'fornecedor_scores',
    'order_items', 'romaneio_itens',
  ];

  for (const t of tabelas) {
    // pegar uma linha existente para ver schema
    const { data, error } = await sb.from(t).select('*').limit(1);
    if (data && data.length) {
      console.log(t, '=>', Object.keys(data[0]).join(', '));
    } else {
      console.log(t, '=> VAZIA, ultima tentativa:', error?.message || 'OK');
    }
  }
})();

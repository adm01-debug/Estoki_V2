require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// descobrir via query no information_schema (funciona via PostgREST em alguns casos)
// alternativa: tentar insert {} e ver se funciona
(async () => {
  const tabelas = ['alertas_config', 'rastreamento_historico', 'orders', 'romaneios', 'ondas_separacao', 'tarefas', 'checkpoints_zona', 'custodia_transferencias', 'ocorrencias_perda', 'conquistas_definicoes', 'relatorios_agendados', 'inventario_ciclos', 'ajustes_estoque', 'audit_log', 'login_logs', 'order_items', 'romaneio_itens'];

  for (const t of tabelas) {
    const { data, error } = await sb.from(t).insert({}).select();
    if (!error && data) {
      console.log(t, '=> aceita vazio. Colunas:', Object.keys(data[0]).join(', '));
      await sb.from(t).delete().eq('id', data[0].id);
    } else {
      console.log(t, '=> ERRO:', error?.message);
    }
  }
})();

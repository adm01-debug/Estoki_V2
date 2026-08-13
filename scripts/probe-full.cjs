require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const tabelas = {
  'alertas_config': { tipo: 'TEST' },
  'rastreamento_historico': { tipo_evento: 'TEST' },
  'orders': { codigo: 'TEST-X' },
  'romaneios': { codigo: 'TEST-X' },
  'ondas_separacao': { codigo: 'TEST-X' },
  'checkpoints_zona': { zona: 'TEST' },
  'ocorrencias_perda': { codigo: 'TEST-X' },
  'conquistas_definicoes': { codigo: 'TEST-X' },
  'relatorios_agendados': { nome: 'TEST' },
  'inventario_ciclos': { nome: 'TEST' },
  'ajustes_estoque': { produto_id: '00000000-0000-0000-0000-000000000000' },
  'audit_log': { action: 'TEST' },
  'login_logs': { user_id: '00000000-0000-0000-0000-000000000000' },
  'order_items': { quantidade: 1 },
  'romaneio_itens': { romaneio_id: '00000000-0000-0000-0000-000000000000' },
};

(async () => {
  for (const [t, base] of Object.entries(tabelas)) {
    const { data, error } = await sb.from(t).insert(base).select();
    if (error) {
      console.log(t, '=> ERRO:', error.message);
      continue;
    }
    if (data && data[0]) {
      const cols = Object.keys(data[0]);
      console.log(t, '\n  ', cols.join(', '));
      // limpar
      await sb.from(t).delete().eq('id', data[0].id);
    }
  }
})();

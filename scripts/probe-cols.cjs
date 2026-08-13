require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

(async () => {
  // descobrir schema via erros de insert
  const tabelas = {
    'alertas_config': ['tipo', 'limite', 'threshold', 'configuracao', 'ativo'],
    'rastreamento_historico': ['lote_id', 'acao', 'tipo_acao', 'descricao', 'observacao', 'usuario_id', 'perfil_id'],
    'orders': ['numero', 'numero_pedido', 'cliente_id', 'cliente_nome', 'status', 'valor_total'],
    'romaneios': ['numero', 'numero_romaneio', 'status', 'data_emissao'],
    'ondas_separacao': ['numero', 'numero_onda', 'status'],
    'tarefas': ['titulo', 'title', 'descricao', 'descricao', 'usuario_id', 'user_id', 'responsavel_id'],
    'checkpoints_zona': ['nome', 'name', 'zona'],
    'custodia_transferencias': ['lote_id', 'responsavel_id'],
    'ocorrencias_perda': ['titulo', 'tipo', 'observacao', 'descricao_evento'],
    'conquistas_definicoes': ['codigo', 'nome', 'tipo', 'requisito_tipo', 'criterio'],
    'relatorios_agendados': ['nome', 'frequencia', 'tipo_relatorio'],
    'inventario_ciclos': ['nome', 'status'],
    'ajustes_estoque': ['quantidade_ajuste', 'quantidade_anterior', 'nova_quantidade'],
    'audit_log': ['acao', 'action', 'tipo', 'operacao'],
    'login_logs': ['sucesso', 'success', 'status'],
    'fornecedor_scores': ['fornecedor', 'nome_fornecedor'],
  };

  for (const [t, candidates] of Object.entries(tabelas)) {
    console.log(`\n=== ${t} ===`);
    for (const col of candidates) {
      const probe = {};
      probe[col] = col === 'lote_id' ? '00000000-0000-0000-0000-000000000000' : 'x';
      const { error } = await sb.from(t).insert(probe);
      if (!error) {
        console.log('  OK coluna:', col);
        await sb.from(t).delete().eq(col, probe[col]);
        break;
      }
    }
  }
})();

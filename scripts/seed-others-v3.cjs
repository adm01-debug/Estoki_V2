require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getFKs() {
  const [profiles, produtos, posicoes] = await Promise.all([
    sb.from('profiles').select('id, email').limit(10),
    sb.from('produtos').select('id, nome').limit(10),
    sb.from('posicoes_estoque').select('id, codigo').limit(10),
  ]);
  return {
    profiles: profiles.data || [],
    produtos: produtos.data || [],
    posicoes: posicoes.data || [],
  };
}

function pick(arr, i) { return arr[i % arr.length]; }

async function insert(table, records) {
  if (!records.length) return true;
  const { error } = await sb.from(table).insert(records);
  if (error) {
    console.log(`${table}: ${error.message}`);
    return false;
  }
  console.log(`${table}: ${records.length} OK`);
  return true;
}

// ─── alertas_config ───────────────────────────────────────────
async function seedAlertasConfig() {
  await insert('alertas_config', [
    { tipo: 'estoque_minimo', ativo: true, threshold_valor: 10, threshold_dias: 3, severidade: 'aviso', notificar_email: true, notificar_push: true, descricao: 'Alerta quando estoque fica abaixo de 10 unidades' },
    { tipo: 'vencimento_proximo', ativo: true, threshold_valor: 30, threshold_dias: 30, severidade: 'critico', notificar_email: true, notificar_push: false, descricao: 'Alerta 30 dias antes do vencimento de lotes' },
    { tipo: 'item_sem_movimentacao', ativo: true, threshold_valor: 90, threshold_dias: 1, severidade: 'info', notificar_email: false, notificar_push: true, descricao: 'Alerta para itens sem movimentação há 90 dias' },
    { tipo: 'estoque_minimo', ativo: true, threshold_valor: 5, threshold_dias: 7, severidade: 'urgente', notificar_email: true, notificar_push: true, descricao: 'Alerta crítico para estoque menor que 5' },
    { tipo: 'gargalo_triagem', ativo: true, threshold_valor: 10, threshold_dias: 1, severidade: 'aviso', notificar_email: true, notificar_push: false, descricao: 'Notifica gargalo na triagem' },
  ]);
}

// ─── rastreamento_historico ─────────────────────────────────
async function seedRastreamento(fks) {
  const tipos = ['separacao', 'armazenamento', 'recebimento_nf', 'conferencia', 'triagem_inicio', 'triagem_fim'];
  const locs = ['Rua A - Piso 1', 'Rua B - Piso 2', 'Rua C - Piso 1', 'Doca 1', 'Doca 2', 'Área de Expedição'];
  const records = [];
  for (let i = 0; i < 20; i++) {
    records.push({
      produto_id: pick(fks.produtos, i).id,
      tipo_evento: pick(tipos, i),
      descricao: `Evento de ${pick(tipos, i)} registrado no sistema`,
      detalhes: JSON.stringify({ origem: 'seed', produto: pick(fks.produtos, i).nome }),
      quantidade: Math.floor(Math.random() * 50) + 5,
      documento_referencia: `DOC-${String(10000 + i).padStart(6, '0')}`,
      operador_id: pick(fks.profiles, i).id,
      data_evento: new Date(Date.now() - (i + 1) * 3 * 3600000).toISOString(),
      localizacao: pick(locs, i),
    });
  }
  await insert('rastreamento_historico', records);
}

// ─── ondas_separacao (sem tasks dependentes) ─────────────────
async function seedOndas(fks) {
  const descs = ['Separação de pedidos do dia', 'Onda de reposição de picking', 'Separação prioritária urgente'];
  const zonas = ['ZONA-A', 'ZONA-B', 'ZONA-C'];
  await insert('ondas_separacao', [
    { codigo: 'OND-0001', descricao: descs[0], zona_alvo: zonas[0], rota: 'ROTA-A', status: 'pendente', prioridade: 'alta', data_criacao: new Date().toISOString(), responsavel_id: pick(fks.profiles, 0).id },
    { codigo: 'OND-0002', descricao: descs[1], zona_alvo: zonas[1], rota: 'ROTA-B', status: 'em_andamento', prioridade: 'media', data_criacao: new Date(Date.now() - 86400000).toISOString(), data_inicio: new Date(Date.now() - 3600000).toISOString(), total_tarefas: 15, tarefas_concluidas: 8, responsavel_id: pick(fks.profiles, 1).id },
    { codigo: 'OND-0003', descricao: descs[2], zona_alvo: zonas[2], rota: 'ROTA-C', status: 'concluida', prioridade: 'alta', data_criacao: new Date(Date.now() - 172800000).toISOString(), data_inicio: new Date(Date.now() - 86400000).toISOString(), data_conclusao: new Date().toISOString(), total_tarefas: 20, tarefas_concluidas: 20, responsavel_id: pick(fks.profiles, 2).id },
  ]);
}

// ─── checkpoints_zona ────────────────────────────────────────
async function seedCheckpoints(fks) {
  const zonas = ['ZONA-A', 'ZONA-B', 'ZONA-C', 'ZONA-D'];
  const tipos = ['entrada', 'saida', 'contagem', 'transferencia'];
  await insert('checkpoints_zona', zonas.map((z, i) => ({
    produto_id: pick(fks.produtos, i).id,
    quantidade: Math.floor(Math.random() * 50) + 5,
    zona: z, tipo: tipos[i],
    operador_id: pick(fks.profiles, i).id,
    posicao_id: pick(fks.posicoes, i).id,
    observacoes: `Checkpoint ${z} - ${tipos[i]}`,
  })));
}

// ─── custodia_transferencias ────────────────────────────────
async function seedCustodia(fks) {
  const zonas = ['ZONA-A', 'ZONA-B', 'ZONA-C'];
  const statuses = ['pendente', 'em_transito', 'concluida', 'cancelada'];
  const records = [];
  for (let i = 0; i < 5; i++) {
    records.push({
      produto_id: pick(fks.produtos, i).id,
      quantidade: Math.floor(Math.random() * 30) + 5,
      operador_origem_id: pick(fks.profiles, i).id,
      operador_destino_id: pick(fks.profiles, i + 1).id,
      zona_origem: zonas[i % 3],
      zona_destino: zonas[(i + 1) % 3],
      status: pick(statuses, i),
      motivo: 'Reposição de estoque entre zonas',
    });
  }
  await insert('custodia_transferencias', records);
}

// ─── ocorrencias_perda ─────────────────────────────────────
async function seedOcorrencias(fks) {
  const tipos = ['avaria', 'furto', 'vencimento', 'erro_separacao'];
  const statuses = ['investigando', 'encerrada', 'descartada'];
  await insert('ocorrencias_perda', [
    { codigo: 'OCP-2025001', tipo: 'avaria', produto_id: pick(fks.produtos, 0).id, quantidade: 5, zona_detectada: 'ZONA-A', reportado_por: pick(fks.profiles, 0).id, status: 'investigando', valor_prejuizo: 250.00 },
    { codigo: 'OCP-2025002', tipo: 'vencimento', produto_id: pick(fks.produtos, 1).id, quantidade: 12, zona_detectada: 'ZONA-B', reportado_por: pick(fks.profiles, 1).id, status: 'encerrada', valor_prejuizo: 480.00 },
    { codigo: 'OCP-2025003', tipo: 'erro_separacao', produto_id: pick(fks.produtos, 2).id, quantidade: 3, zona_detectada: 'ZONA-C', reportado_por: pick(fks.profiles, 2).id, status: 'investigando', valor_prejuizo: 90.00 },
  ]);
}

// ─── conquistas_definicoes ──────────────────────────────────
async function seedConquistas(fks) {
  await insert('conquistas_definicoes', [
    { codigo: 'SEP-001', nome: 'Primeira Separação', descricao: 'Complete sua primeira separação', icone: '🏭', raridade: 'comum', categoria: 'produtividade', pontos: 10, meta: 1, criterio: 'total_separacoes', ativo: true },
    { codigo: 'SEP-100', nome: 'Separador Expert', descricao: 'Complete 100 separações', icone: '⭐', raridade: 'raro', categoria: 'produtividade', pontos: 500, meta: 100, criterio: 'total_separacoes', ativo: true },
    { codigo: 'VELOZ', nome: 'Veloz e Furioso', descricao: 'Separe 10 pedidos em menos de 1 hora', icone: '⚡', raridade: 'epico', categoria: 'produtividade', pontos: 300, meta: 10, criterio: 'velocidade_separacao', ativo: true },
    { codigo: 'ZERO-ERRO', nome: 'Precisão Perfeita', descricao: '100 separações sem erro', icone: '🎯', raridade: 'lendario', categoria: 'qualidade', pontos: 1000, meta: 100, criterio: 'separacoes_sem_erro', ativo: true },
    { codigo: 'STREAK-7', nome: 'Semana Perfeita', descricao: '7 dias consecutivos separando', icone: '🔥', raridade: 'raro', categoria: 'consistencia', pontos: 200, meta: 7, criterio: 'dias_consecutivos', ativo: true },
    { codigo: 'REPOS-050', nome: 'Repositor Dedicado', descricao: 'Complete 50 reposições', icone: '📦', raridade: 'comum', categoria: 'produtividade', pontos: 100, meta: 50, criterio: 'total_reposicoes', ativo: true },
    { codigo: 'CHECK-200', nome: 'Guarda do Estoque', descricao: 'Realize 200 checkpoints', icone: '🛡️', raridade: 'raro', categoria: 'produtividade', pontos: 400, meta: 200, criterio: 'total_checkpoints', ativo: true },
  ]);
}

// ─── conquistas_usuarios ────────────────────────────────────
async function seedConquistasUsuarios(fks) {
  const { data: defs } = await sb.from('conquistas_definicoes').select('id').limit(4);
  if (!defs || !defs.length) { console.log('conquistas_usuarios: pulado'); return; }
  const records = fks.profiles.slice(0, 4).map((p, i) => ({
    user_id: p.id,
    conquista_id: defs[i].id,
    progresso: Math.floor(Math.random() * 100),
    desbloqueada: i < 2,
    data_desbloqueio: i < 2 ? new Date(Date.now() - (i + 1) * 86400000).toISOString() : null,
  }));
  await insert('conquistas_usuarios', records);
}

// ─── relatorios_agendados ──────────────────────────────────
async function seedRelatorios(fks) {
  await insert('relatorios_agendados', [
    { nome: 'Movimentação Diária', tipo: 'movimentacao', frequencia: 'diaria', destinatarios: ['ti@promobrindes.com.br', 'admin@estoki.com.br'], ativo: true, criado_por: pick(fks.profiles, 0).id },
    { nome: 'Estoque por Zona', tipo: 'estoque', frequencia: 'semanal', destinatarios: ['ti@promobrindes.com.br'], ativo: true, criado_por: pick(fks.profiles, 1).id },
    { nome: 'Eficiência Separadores', tipo: 'performance', frequencia: 'mensal', destinatarios: ['admin@estoki.com.br'], ativo: false, criado_por: pick(fks.profiles, 0).id },
  ]);
}

// ─── inventario_ciclos ─────────────────────────────────────
async function seedInventario(fks) {
  await insert('inventario_ciclos', [
    { nome: 'Inventário Semanal ZONA-A', descricao: 'Contagem semanal da zona A', tipo: 'semanal', zona_alvo: 'ZONA-A', porta_palete_alvo: 'PP-01', data_agendada: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'agendado', responsavel_id: pick(fks.profiles, 0).id },
    { nome: 'Inventário Mensal Geral', descricao: 'Contagem mensal de todo o armazém', tipo: 'mensal', data_agendada: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], status: 'agendado', responsavel_id: pick(fks.profiles, 1).id },
  ]);
}

// ─── ajustes_estoque ───────────────────────────────────────
async function seedAjustes(fks) {
  const records = [];
  for (let i = 0; i < 4; i++) {
    const qtdAnt = Math.floor(Math.random() * 50) + 20;
    const diff = Math.floor(Math.random() * 10) - 4;
    records.push({
      produto_id: pick(fks.produtos, i).id,
      quantidade_anterior: qtdAnt,
      quantidade_nova: qtdAnt + diff,
      diferenca: diff,
      motivo: i % 2 === 0 ? 'Contagem física' : 'Divergência de inventário',
      status: i < 2 ? 'aprovado' : 'pendente',
      operador_id: pick(fks.profiles, i).id,
      aprovado_por: i < 2 ? pick(fks.profiles, i + 1).id : null,
    });
  }
  await insert('ajustes_estoque', records);
}

// ─── audit_log ─────────────────────────────────────────────
async function seedAudit(fks) {
  const actions = ['create', 'update', 'delete', 'login', 'logout'];
  const entities = ['produto', 'lote', 'posicao_estoque', 'user', 'triagem', 'romaneio', 'ajuste', 'notificacao'];
  const records = [];
  for (let i = 0; i < 8; i++) {
    records.push({
      user_id: pick(fks.profiles, i).id,
      action: pick(actions, i),
      entity_type: pick(entities, i),
      entity_id: pick(fks.produtos, i).id,
      old_values: i % 2 === 0 ? JSON.stringify({ status: 'ativo' }) : null,
      new_values: JSON.stringify({ nome: 'Atualizado' }),
      metadata: JSON.stringify({ source: 'seed' }),
      ip_address: `192.168.1.${10 + i}`,
      user_agent: 'Mozilla/5.0 (Windows NT 10.0)',
      created_at: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    });
  }
  await insert('audit_log', records);
}

// ─── login_logs ────────────────────────────────────────────
async function seedLoginLogs(fks) {
  const browsers = ['Chrome 120', 'Firefox 121', 'Edge 120', 'Chrome 119', 'Safari 17', 'Firefox 120'];
  const oss = ['Windows 10', 'macOS 14', 'Windows 11', 'Ubuntu 22.04', 'macOS 15', 'Windows 10'];
  const locs = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Curitiba, PR', 'Belo Horizonte, MG', 'Salvador, BA', 'Fortaleza, CE'];
  const records = [];
  for (let i = 0; i < 6; i++) {
    records.push({
      user_id: pick(fks.profiles, i).id,
      ip_address: `189.${30 + i}.${i}.${100 + i}`,
      browser: browsers[i],
      os: oss[i],
      location: locs[i],
      is_new_device: i === 0,
      login_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      success: true,
    });
  }
  await insert('login_logs', records);
}

// ─── fornecedor_scores ─────────────────────────────────────
async function seedFornecedores() {
  await insert('fornecedor_scores', [
    { fornecedor: 'Alpha Ltda', total_entregas: 45, entregas_conformes: 43, entregas_divergentes: 2, lead_time_medio_dias: 5, score: 92.5 },
    { fornecedor: 'Beta Distribuidora S.A.', total_entregas: 30, entregas_conformes: 24, entregas_divergentes: 6, lead_time_medio_dias: 8, score: 78.3 },
    { fornecedor: 'Gamma Importadora ME', total_entregas: 22, entregas_conformes: 21, entregas_divergentes: 1, lead_time_medio_dias: 4, score: 88.0 },
    { fornecedor: 'Delta Comercial Eireli', total_entregas: 15, entregas_conformes: 8, entregas_divergentes: 7, lead_time_medio_dias: 12, score: 65.5 },
    { fornecedor: 'Epsilon Atacadista', total_entregas: 60, entregas_conformes: 60, entregas_divergentes: 0, lead_time_medio_dias: 3, score: 95.0 },
  ]);
}

// ─── notificacoes ──────────────────────────────────────────
async function seedNotificacoes(fks) {
  const tipos = ['info', 'alerta', 'sucesso', 'erro', 'info'];
  const titulos = ['Novo pedido recebido', 'Estoque baixo detectado', 'Romaneio concluído', 'Falha na sincronização', 'Triagem pendente'];
  const msgs = ['O pedido PED-2025001 foi registrado e está aguardando separação.', 'O produto "Caneta Bic" está com apenas 8 unidades em estoque.', 'Romaneio ROM-2025003 foi entregue com sucesso.', 'Não foi possível sincronizar 3 registros com o servidor.', ' Existem 5 triagens pendentes de análise.'];
  const records = fks.profiles.slice(0, 5).map((p, i) => ({
    user_id: p.id,
    tipo: tipos[i],
    titulo: titulos[i],
    mensagem: msgs[i],
    lida: i < 2,
    data_leitura: i < 2 ? new Date(Date.now() - i * 3600000).toISOString() : null,
  }));
  await insert('notificacoes', records);
}

// ─── orders ──────────────────────────────────────────────────
async function seedOrders(fks) {
  const statuses = ['pendente', 'em_separacao', 'embalagem', 'aguardando_transporte', 'enviado', 'cancelado'];
  const clientes = ['Maria Comercio Ltda', 'João Silva ME', 'Distribuidora ABC S.A.', 'Supermercado Central', 'Armazém Geral Eireli'];
  await insert('orders', [
    { codigo: 'PED-2025001', cliente_nome: clientes[0], status: 'pendente', prioridade: 2, data_prometida: new Date(Date.now() + 86400000).toISOString().split('T')[0], observacoes: 'Pedido prioritário' },
    { codigo: 'PED-2025002', cliente_nome: clientes[1], status: 'em_separacao', prioridade: 1, data_prometida: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
    { codigo: 'PED-2025003', cliente_nome: clientes[2], status: 'embalagem', prioridade: 1, data_prometida: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { codigo: 'PED-2025004', cliente_nome: clientes[3], status: 'enviado', prioridade: 3, data_prometida: new Date(Date.now() - 86400000).toISOString().split('T')[0], observacoes: 'Urgente - entregar hoje' },
    { codigo: 'PED-2025005', cliente_nome: clientes[4], status: 'pendente', prioridade: 1, data_prometida: new Date(Date.now() + 259200000).toISOString().split('T')[0] },
  ]);
}

// ─── order_items ────────────────────────────────────────────
async function seedOrderItems(fks) {
  const { data: ords } = await sb.from('orders').select('id').limit(5);
  if (!ords || !ords.length) { console.log('order_items: pulado'); return; }
  const records = [];
  for (let i = 0; i < 15; i++) {
    records.push({
      order_id: pick(ords, i).id,
      produto_id: pick(fks.produtos, i).id,
      quantidade: Math.floor(Math.random() * 20) + 1,
      quantidade_atendida: i < 5 ? 0 : Math.floor(Math.random() * 15) + 1,
    });
  }
  await insert('order_items', records);
}

// ─── tarefas ────────────────────────────────────────────────
async function seedTarefas(fks) {
  const { data: ondas } = await sb.from('ondas_separacao').select('id').limit(12);
  const zonas = ['ZONA-A', 'ZONA-B', 'ZONA-C'];
  const statuses = ['pendente', 'em_andamento', 'concluida', 'cancelada'];
  const records = [];
  for (let i = 0; i < 12; i++) {
    const createdAt = new Date(Date.now() - (i + 1) * 3600000).toISOString();
    records.push({
      onda_id: ondas && ondas[i % ondas.length] ? ondas[i % ondas.length].id : null,
      tipo: i % 3 === 0 ? 'separacao' : i % 3 === 1 ? 'inventario' : 'transferencia',
      status: pick(statuses, i),
      prioridade: i % 2 === 0 ? 'alta' : 'media',
      produto_id: pick(fks.produtos, i).id,
      posicao_origem_id: pick(fks.posicoes, i).id,
      posicao_destino_id: pick(fks.posicoes, i + 1).id,
      quantidade: Math.floor(Math.random() * 10) + 1,
      operador_id: pick(fks.profiles, i).id,
      zona: pick(zonas, i),
      instrucoes: `Instrução para tarefa ${i + 1}`,
      data_atribuicao: createdAt,
      data_inicio: i > 3 ? new Date(Date.now() - i * 1800000).toISOString() : null,
      data_conclusao: i > 6 ? new Date(Date.now() - (i - 6) * 900000).toISOString() : null,
      created_at: createdAt,
    });
  }
  await insert('tarefas', records);
}

// ─── romaneios ─────────────────────────────────────────────
async function seedRomaneios(fks) {
  const statuses = ['rascunho', 'confirmado', 'em_transito', 'entregue', 'parcial', 'cancelado'];
  await insert('romaneios', [
    { codigo: 'ROM-2025001', data_criacao: new Date(Date.now() - 86400000).toISOString(), data_prevista_entrega: new Date(Date.now() + 86400000).toISOString(), status: 'em_transito', motorista: 'Carlos Silva', placa_veiculo: 'ABC-1234', tipo_veiculo: 'Van', rota: 'Rota Sul', total_volumes: 45, total_entregas: 12, entregas_realizadas: 8, responsavel_id: pick(fks.profiles, 0).id },
    { codigo: 'ROM-2025002', data_criacao: new Date(Date.now() - 172800000).toISOString(), data_prevista_entrega: new Date().toISOString(), status: 'confirmado', motorista: 'Pedro Santos', placa_veiculo: 'DEF-5678', tipo_veiculo: 'Caminhão', rota: 'Rota Norte', total_volumes: 120, total_entregas: 25, entregas_realizadas: 0, responsavel_id: pick(fks.profiles, 1).id },
    { codigo: 'ROM-2025003', data_criacao: new Date(Date.now() - 259200000).toISOString(), data_prevista_entrega: new Date(Date.now() - 86400000).toISOString(), status: 'entregue', motorista: 'Carlos Silva', placa_veiculo: 'ABC-1234', tipo_veiculo: 'Van', rota: 'Rota Centro', total_volumes: 80, total_entregas: 18, entregas_realizadas: 18, responsavel_id: pick(fks.profiles, 0).id },
    { codigo: 'ROM-2025004', data_criacao: new Date().toISOString(), data_prevista_entrega: new Date(Date.now() + 172800000).toISOString(), status: 'rascunho', rota: 'Rota Leste', total_volumes: 0, total_entregas: 0, entregas_realizadas: 0, responsavel_id: pick(fks.profiles, 2).id },
    { codigo: 'ROM-2025005', data_criacao: new Date(Date.now() - 345600000).toISOString(), data_prevista_entrega: new Date(Date.now() - 172800000).toISOString(), status: 'parcial', motorista: 'Ana Oliveira', placa_veiculo: 'GHI-9012', tipo_veiculo: 'Van', rota: 'Rota Oeste', total_volumes: 60, total_entregas: 15, entregas_realizadas: 12, responsavel_id: pick(fks.profiles, 3).id },
  ]);
}

// ─── romaneio_itens ─────────────────────────────────────────
async function seedRomaneioItens(fks) {
  const { data: rms } = await sb.from('romaneios').select('id').limit(5);
  if (!rms || !rms.length) { console.log('romaneio_itens: pulado'); return; }
  const clientes = ['Maria Comercio Ltda', 'João Silva ME', 'Distribuidora ABC S.A.', 'Supermercado Central'];
  const records = [];
  for (let i = 0; i < 20; i++) {
    records.push({
      romaneio_id: pick(rms, i).id,
      produto_id: pick(fks.produtos, i).id,
      quantidade: Math.floor(Math.random() * 20) + 1,
      peso_kg: Math.round(Math.random() * 50 + 5),
      cliente: pick(clientes, i),
      endereco_entrega: `Rua ${i + 1}, ${100 + i} - Bairro Centro, São Paulo - SP`,
      telefone_cliente: `(11) 9${String(1000 + i).slice(-4)}-${String(1000 + i).slice(-4)}`,
      pedido_referencia: `PED-${String(2025001 + i).padStart(7, '0')}`,
    });
  }
  await insert('romaneio_itens', records);
}

// ─── main ──────────────────────────────────────────────────
(async () => {
  console.log('=== Seed Tabelas Restantes ===');
  const fks = await getFKs();
  console.log('FKs:', { profiles: fks.profiles.length, produtos: fks.produtos.length, posicoes: fks.posicoes.length });

  await seedAlertasConfig();
  await seedRastreamento(fks);
  await seedOndas(fks);
  await seedCheckpoints(fks);
  await seedCustodia(fks);
  await seedOcorrencias(fks);
  await seedConquistas(fks);
  await seedConquistasUsuarios(fks);
  await seedRelatorios(fks);
  await seedInventario(fks);
  await seedAjustes(fks);
  await seedAudit(fks);
  await seedLoginLogs(fks);
  await seedFornecedores();
  await seedNotificacoes(fks);
  await seedTarefas(fks);
  await seedOrders(fks);
  await seedOrderItems(fks);
  await seedRomaneios(fks);
  await seedRomaneioItens(fks);

  console.log('\n=== Seed Concluído ===');
})();

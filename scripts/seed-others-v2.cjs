require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getFKs() {
  const { data: p } = await sb.from("profiles").select("id, email").limit(10);
  const { data: pr } = await sb.from("produtos").select("id, nome").limit(10);
  const { data: lt } = await sb.from("lotes").select("id, codigo").limit(10);
  const { data: ps } = await sb.from("posicoes_estoque").select("id, codigo").limit(10);
  const { data: ep } = await sb.from("estoque_posicao").select("id").limit(5);
  const { data: ods } = await sb.from("ondas_separacao").select("id").limit(5);
  const { data: rms } = await sb.from("romaneios").select("id").limit(5);
  const { data: ords } = await sb.from("orders").select("id").limit(5);
  return {
    profiles: p || [],
    produtos: pr || [],
    lotes: lt || [],
    posicoes: ps || [],
    estoquePosicoes: ep || [],
    ondas: ods || [],
    romaneios: rms || [],
    orders: ords || [],
  };
}

function pick(arr, idx) {
  return arr[idx % arr.length];
}

async function seedAlertasConfig(fks) {
  const configs = [
    {
      tipo: "estoque_minimo",
      ativo: true,
      threshold_valor: 10,
      threshold_dias: 3,
      severidade: "aviso",
      notificar_email: true,
      notificar_push: true,
      descricao: "Alerta quando estoque de um produto fica abaixo de 10 unidades",
    },
    {
      tipo: "vencimento_proximo",
      ativo: true,
      threshold_valor: 30,
      threshold_dias: 30,
      severidade: "critico",
      notificar_email: true,
      notificar_push: false,
      descricao: "Alerta 30 dias antes do vencimento de lotes",
    },
    {
      tipo: "item_sem_movimentacao",
      ativo: true,
      threshold_valor: 100,
      threshold_dias: 1,
      severidade: "info",
      notificar_email: false,
      notificar_push: true,
      descricao: "Alerta para itens sem movimentação",
    },
    {
      tipo: "estoque_minimo",
      ativo: true,
      threshold_valor: 5,
      threshold_dias: 7,
      severidade: "urgente",
      notificar_email: true,
      notificar_push: true,
      descricao: "Alerta crítico para produtos com estoque menor que 5",
    },
    {
      tipo: "gargalo_triagem",
      ativo: true,
      threshold_valor: 1,
      threshold_dias: 1,
      severidade: "aviso",
      notificar_email: true,
      notificar_push: false,
      descricao: "Notifica quando gargalo na triagem",
    },
  ];
  const { error } = await sb.from("alertas_config").insert(configs);
  if (error) console.log("alertas_config:", error.message);
  else console.log("alertas_config: 5 OK");
}

async function seedRastreamentoHistorico(fks) {
  const tipos = ["recebimento", "separacao", "expedicao", "transferencia", "ajuste"];
  const locs = [
    "Rua A - Piso 1",
    "Rua B - Piso 2",
    "Rua C - Piso 1",
    "Doca 1",
    "Doca 2",
    "Área de Expedição",
  ];
  const ops = fks.profiles;
  const prods = fks.produtos;
  const lotes = fks.lotes;
  const posicoes = fks.posicoes;

  const records = [];
  for (let i = 0; i < 20; i++) {
    const tipo = pick(tipos, i);
    const horasAtras = (i + 1) * 3;
    records.push({
      produto_id: pick(prods, i).id,
      lote_id: null,
      posicao_id: pick(posicoes, i).id,
      tipo_evento: tipo,
      descricao: `Evento de ${tipo} registrado no sistema`,
      detalhes: JSON.stringify({ origem: "seed", produto: pick(prods, i).nome }),
      quantidade: Math.floor(Math.random() * 50) + 5,
      documento_referencia: `DOC-${String(i + 100).padStart(5, "0")}`,
      operador_id: pick(ops, i).id,
      data_evento: new Date(Date.now() - horasAtras * 3600000).toISOString(),
      localizacao: pick(locs, i),
    });
  }
  const { error } = await sb.from("rastreamento_historico").insert(records);
  if (error) console.log("rastreamento_historico:", error.message);
  else console.log("rastreamento_historico: 20 OK");
}

async function seedOrders(fks) {
  const statuses = ["pendente", "em_separacao", "separado", "expedido", "cancelado"];
  const prioridades = ["baixa", "normal", "alta", "urgente"];
  const clientes = [
    "Maria Comercio Ltda",
    "João Silva ME",
    "Distribuidora ABC S.A.",
    "Supermercado Central",
    "Armazém Geral Eireli",
  ];

  const records = [];
  for (let i = 0; i < 5; i++) {
    const diasAtras = i * 2;
    records.push({
      codigo: `PED-${String(2025001 + i).padStart(7, "0")}`,
      cliente_id: pick(fks.profiles, i).id,
      cliente_nome: clientes[i],
      status: pick(statuses, i),
      prioridade: pick(prioridades, i),
      data_prometida: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
      observacoes: `Pedido ${i + 1} - gerado para teste`,
    });
  }
  const { error } = await sb.from("orders").insert(records);
  if (error) console.log("orders:", error.message);
  else console.log("orders: 5 OK");
}

async function seedOrderItems(fks) {
  // precisa de orders existentes — tenta buscar
  const { data: ords } = await sb.from("orders").select("id").limit(5);
  const prods = fks.produtos;
  if (!ords || ords.length === 0) {
    console.log("order_items: pulado (sem orders)");
    return;
  }
  const records = [];
  for (let i = 0; i < 15; i++) {
    records.push({
      order_id: pick(ords, i).id,
      produto_id: pick(prods, i).id,
      quantidade: Math.floor(Math.random() * 20) + 1,
      quantidade_atendida: i < 5 ? 0 : Math.floor(Math.random() * 15) + 1,
    });
  }
  const { error } = await sb.from("order_items").insert(records);
  if (error) console.log("order_items:", error.message);
  else console.log("order_items: 15 OK");
}

async function seedOndasSeparacao(fks) {
  const statuses = ["pendente", "em_andamento", "concluida"];
  const prioridades = ["normal", "alta", "urgente"];
  const zonas = ["ZONA-A", "ZONA-B", "ZONA-C"];
  const descs = [
    "Separação de pedidos do dia",
    "Onda de reposição de picking",
    "Separação prioritária urgente",
  ];

  const records = [];
  for (let i = 0; i < 3; i++) {
    const diasAtras = i;
    records.push({
      codigo: `OND-${String(1001 + i).padStart(4, "0")}`,
      descricao: descs[i],
      zona_alvo: pick(zonas, i),
      rota: `ROTA-${String.fromCharCode(65 + i)}`,
      status: pick(statuses, i),
      prioridade: pick(prioridades, i),
      data_criacao: new Date(Date.now() - diasAtras * 86400000).toISOString(),
      data_inicio: i > 0 ? new Date(Date.now() - (diasAtras - 1) * 86400000).toISOString() : null,
      data_conclusao: i === 2 ? new Date().toISOString() : null,
      total_tarefas: 10 + i * 5,
      tarefas_concluidas: i === 0 ? 0 : i === 1 ? 8 : 15,
      responsavel_id: pick(fks.profiles, i).id,
    });
  }
  const { error } = await sb.from("ondas_separacao").insert(records);
  if (error) console.log("ondas_separacao:", error.message);
  else console.log("ondas_separacao: 3 OK");
}

async function seedTarefas(fks) {
  const { data: ondas } = await sb.from("ondas_separacao").select("id").limit(5);
  const prods = fks.produtos;
  const posicoes = fks.posicoes;
  const ops = fks.profiles;

  if (!ondas || ondas.length === 0) {
    console.log("tarefas: pulado (sem ondas)");
    return;
  }

  const tipos = ["separacao", "reposicao", "transferencia", "inventario"];
  const statuses = ["pendente", "em_andamento", "concluida", "cancelada"];
  const prioridades = ["baixa", "normal", "alta"];
  const zonas = ["ZONA-A", "ZONA-B", "ZONA-C"];

  const records = [];
  for (let i = 0; i < 12; i++) {
    const createdAt = new Date(Date.now() - (i + 1) * 3600000).toISOString();
    records.push({
      onda_id: pick(ondas, i).id,
      tipo: pick(tipos, i),
      status: pick(statuses, i),
      prioridade: pick(prioridades, i),
      produto_id: pick(prods, i).id,
      posicao_origem_id: pick(posicoes, i).id,
      posicao_destino_id: pick(posicoes, i + 1).id,
      quantidade: Math.floor(Math.random() * 10) + 1,
      quantidade_executada: 0,
      operador_id: pick(ops, i).id,
      zona: pick(zonas, i),
      rota: `ROTA-${String.fromCharCode(65 + (i % 3))}`,
      instrucoes: `Instrução para tarefa ${i + 1}`,
      observacoes: null,
      data_atribuicao: createdAt,
      data_inicio: i > 3 ? new Date(Date.now() - i * 1800000).toISOString() : null,
      data_conclusao: i > 6 ? new Date(Date.now() - (i - 6) * 900000).toISOString() : null,
      tempo_estimado_minutos: 10 + i * 2,
      tempo_real_minutos: i > 6 ? 8 + i : null,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    });
  }
  const { error } = await sb.from("tarefas").insert(records);
  if (error) console.log("tarefas:", error.message);
  else console.log("tarefas: 12 OK");
}

async function seedCheckpointsZona(fks) {
  const zonas = ["ZONA-A", "ZONA-B", "ZONA-C", "ZONA-D"];
  const tipos = ["entrada", "saida", "contagem", "transferencia"];
  const prods = fks.produtos;
  const lotes = fks.lotes;
  const posicoes = fks.posicoes;
  const ops = fks.profiles;

  const records = [];
  for (let i = 0; i < 4; i++) {
    records.push({
      produto_id: pick(prods, i).id,
      lote_id: null,
      quantidade: Math.floor(Math.random() * 50) + 5,
      zona: zonas[i],
      tipo: tipos[i],
      operador_id: pick(ops, i).id,
      posicao_id: pick(posicoes, i).id,
      observacoes: `Checkpoint ${zonas[i]} - ${tipos[i]}`,
    });
  }
  const { error } = await sb.from("checkpoints_zona").insert(records);
  if (error) console.log("checkpoints_zona:", error.message);
  else console.log("checkpoints_zona: 4 OK");
}

async function seedCustodiaTransferencias(fks) {
  const zonas = ["ZONA-A", "ZONA-B", "ZONA-C"];
  const statuses = ["pendente", "em_transito", "concluida", "cancelada"];
  const prods = fks.produtos;
  const lotes = fks.lotes;
  const ops = fks.profiles;

  const records = [];
  for (let i = 0; i < 5; i++) {
    records.push({
      produto_id: pick(prods, i).id,
      lote_id: null,
      quantidade: Math.floor(Math.random() * 30) + 5,
      operador_origem_id: pick(ops, i).id,
      operador_destino_id: pick(ops, i + 1).id,
      zona_origem: pick(zonas, i).toString(),
      zona_destino: pick(zonas, i + 1).toString(),
      status: pick(statuses, i),
      motivo: "Reposição de estoque entre zonas",
      observacoes: `Transferência ${i + 1}`,
    });
  }
  const { error } = await sb.from("custodia_transferencias").insert(records);
  if (error) console.log("custodia_transferencias:", error.message);
  else console.log("custodia_transferencias: 5 OK");
}

async function seedOcorrenciasPerda(fks) {
  const statuses = ["investigando", "encerrada", "descartada"];
  const tipos = ["avaria", "furto", "vencimento", "erro_separacao"];
  const prods = fks.produtos;
  const lotes = fks.lotes;
  const ops = fks.profiles;

  const records = [];
  for (let i = 0; i < 3; i++) {
    records.push({
      codigo: `OCP-${String(2025001 + i).padStart(7, "0")}`,
      tipo: pick(tipos, i),
      produto_id: pick(prods, i).id,
      lote_id: null,
      quantidade: (i + 1) * 3,
      zona_detectada: `ZONA-${String.fromCharCode(65 + i)}`,
      reportado_por: pick(ops, i).id,
      status: pick(statuses, i),
      valor_prejuizo: (i + 1) * 150.0,
    });
  }
  const { error } = await sb.from("ocorrencias_perda").insert(records);
  if (error) console.log("ocorrencias_perda:", error.message);
  else console.log("ocorrencias_perda: 3 OK");
}

async function seedConquistasDefinicoes(fks) {
  const cats = ["operacional", "tempo", "volume", "precisao", "streak"];
  const raridades = ["comum", "incomum", "raro", "epico", "lendario"];

  const conquistas = [
    {
      codigo: "SEP-001",
      nome: "Primeira Separação",
      descricao: "Complete sua primeira separação",
      icone: "🏭",
      raridade: "comum",
      categoria: "operacional",
      pontos: 10,
      meta: 1,
      criterio: "total_separacoes",
      ativo: true,
    },
    {
      codigo: "SEP-100",
      nome: "Separador Expert",
      descricao: "Complete 100 separações",
      icone: "⭐",
      raridade: "raro",
      categoria: "volume",
      pontos: 500,
      meta: 100,
      criterio: "total_separacoes",
      ativo: true,
    },
    {
      codigo: "VELOZ",
      nome: "Veloz e Furioso",
      descricao: "Separe 10 pedidos em menos de 1 hora",
      icone: "⚡",
      raridade: "epico",
      categoria: "tempo",
      pontos: 300,
      meta: 10,
      criterio: "velocidade_separacao",
      ativo: true,
    },
    {
      codigo: "ZERO-ERRO",
      nome: "Precisão Perfeita",
      descricao: "100 separações sem erro",
      icone: "🎯",
      raridade: "lendario",
      categoria: "precisao",
      pontos: 1000,
      meta: 100,
      criterio: "separacoes_sem_erro",
      ativo: true,
    },
    {
      codigo: "STREAK-7",
      nome: "Semana Perfeita",
      descricao: "7 dias consecutivos separando",
      icone: "🔥",
      raridade: "raro",
      categoria: "streak",
      pontos: 200,
      meta: 7,
      criterio: "dias_consecutivos",
      ativo: true,
    },
    {
      codigo: "REPOS-050",
      nome: "Repositor Dedicado",
      descricao: "Complete 50 reposições",
      icone: "📦",
      raridade: "incomum",
      categoria: "operacional",
      pontos: 100,
      meta: 50,
      criterio: "total_reposicoes",
      ativo: true,
    },
    {
      codigo: "CHECK-200",
      nome: "Guarda do Estoque",
      descricao: "Realize 200 checkpoints",
      icone: "🛡️",
      raridade: "raro",
      categoria: "operacional",
      pontos: 400,
      meta: 200,
      criterio: "total_checkpoints",
      ativo: true,
    },
  ];

  const { error } = await sb.from("conquistas_definicoes").insert(conquistas);
  if (error) console.log("conquistas_definicoes:", error.message);
  else console.log("conquistas_definicoes: 7 OK");
}

async function seedConquistasUsuarios(fks) {
  const { data: defs } = await sb.from("conquistas_definicoes").select("id").limit(4);
  const ops = fks.profiles;

  if (!defs || defs.length === 0) {
    console.log("conquistas_usuarios: pulado (sem conquistas_definicoes)");
    return;
  }

  const records = [];
  for (let i = 0; i < 4; i++) {
    records.push({
      usuario_id: pick(ops, i).id,
      conquista_id: pick(defs, i).id,
      progresso: Math.floor(Math.random() * 100),
      desbloqueado: i < 2,
      data_desbloqueio: i < 2 ? new Date(Date.now() - (i + 1) * 86400000).toISOString() : null,
    });
  }
  const { error } = await sb.from("conquistas_usuarios").insert(records);
  if (error) console.log("conquistas_usuarios:", error.message);
  else console.log("conquistas_usuarios: 4 OK");
}

async function seedRelatoriosAgendados(fks) {
  const ops = fks.profiles;

  const reports = [
    {
      nome: "Movimentação Diária",
      tipo: "movimentacao",
      frequencia: "diaria",
      destinatarios: ops
        .slice(0, 3)
        .map((p) => p.email)
        .join(","),
      ativo: true,
      criado_por: pick(ops, 0).id,
    },
    {
      nome: "Estoque por Zona",
      tipo: "estoque",
      frequencia: "semanal",
      destinatarios: ops
        .slice(0, 2)
        .map((p) => p.email)
        .join(","),
      ativo: true,
      criado_por: pick(ops, 1).id,
    },
    {
      nome: "Eficiência Separadores",
      tipo: "performance",
      frequencia: "mensal",
      destinatarios: ops.map((p) => p.email).join(","),
      ativo: false,
      criado_por: pick(ops, 0).id,
    },
  ];
  const { error } = await sb.from("relatorios_agendados").insert(reports);
  if (error) console.log("relatorios_agendados:", error.message);
  else console.log("relatorios_agendados: 3 OK");
}

async function seedInventarioCiclos(fks) {
  const ops = fks.profiles;

  const ciclos = [
    {
      nome: "Inventário Semanal ZONA-A",
      descricao: "Contagem semanal da zona A",
      tipo: "semanal",
      zona_alvo: "ZONA-A",
      porta_palete_alvo: "PP-01",
      data_agendada: new Date(Date.now() + 86400000).toISOString(),
      status: "agendado",
      responsavel_id: pick(ops, 0).id,
    },
    {
      nome: "Inventário Mensal Geral",
      descricao: "Contagem mensal de todo o armazém",
      tipo: "mensal",
      zona_alvo: null,
      porta_palete_alvo: null,
      data_agendada: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "agendado",
      responsavel_id: pick(ops, 1).id,
    },
  ];
  const { error } = await sb.from("inventario_ciclos").insert(ciclos);
  if (error) console.log("inventario_ciclos:", error.message);
  else console.log("inventario_ciclos: 2 OK");
}

async function seedAjustesEstoque(fks) {
  const ops = fks.profiles;
  const prods = fks.produtos;
  const lotes = fks.lotes;
  const posicoes = fks.posicoes;

  const records = [];
  for (let i = 0; i < 4; i++) {
    const qtdAnt = Math.floor(Math.random() * 50) + 20;
    const qtdNova =
      qtdAnt +
      (Math.random() > 0.5 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 5));
    records.push({
      produto_id: pick(prods, i).id,
      lote_id: null,
      posicao_id: pick(posicoes, i).id,
      quantidade_anterior: qtdAnt,
      quantidade_nova: qtdNova,
      diferenca: qtdNova - qtdAnt,
      motivo: i % 2 === 0 ? "Contagem física" : "Ajuste por divergência",
      observacoes: `Ajuste ${i + 1}`,
      status: i < 2 ? "aprovado" : "pendente",
      operador_id: pick(ops, i).id,
      aprovado_por: i < 2 ? pick(ops, i + 1).id : null,
      data_aprovacao: i < 2 ? new Date(Date.now() - i * 3600000).toISOString() : null,
    });
  }
  const { error } = await sb.from("ajustes_estoque").insert(records);
  if (error) console.log("ajustes_estoque:", error.message);
  else console.log("ajustes_estoque: 4 OK");
}

async function seedAuditLog(fks) {
  const ops = fks.profiles;
  const prods = fks.produtos;

  const actions = ["create", "update", "delete", "login", "logout"];
  const entities = ["produto", "lote", "posicao_estoque", "user", "triagem"];

  const records = [];
  for (let i = 0; i < 8; i++) {
    records.push({
      user_id: pick(ops, i).id,
      action: pick(actions, i),
      entity_type: pick(entities, i),
      entity_id: pick(prods, i).id,
      old_values: i % 2 === 0 ? JSON.stringify({ status: "ativo" }) : null,
      new_values:
        i % 2 === 0
          ? JSON.stringify({ status: "inativo" })
          : JSON.stringify({ nome: "Atualizado" }),
      metadata: JSON.stringify({ source: "seed", modulo: "sistema" }),
      ip_address: `192.168.1.${10 + i}`,
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      created_at: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    });
  }
  const { error } = await sb.from("audit_log").insert(records);
  if (error) console.log("audit_log:", error.message);
  else console.log("audit_log: 8 OK");
}

async function seedLoginLogs(fks) {
  const ops = fks.profiles;

  const browsers = ["Chrome 120", "Firefox 121", "Edge 120", "Chrome 119"];
  const oss = ["Windows 10", "macOS 14", "Windows 11", "Ubuntu 22.04"];
  const locations = ["São Paulo, SP", "Rio de Janeiro, RJ", "Curitiba, PR", "Belo Horizonte, MG"];

  const records = [];
  for (let i = 0; i < 6; i++) {
    records.push({
      user_id: pick(ops, i).id,
      device_id: `device-${i + 1}`,
      ip_address: `189.${30 + i}.${i}.${100 + i}`,
      browser: pick(browsers, i),
      os: pick(oss, i),
      location: pick(locations, i),
      is_new_device: i === 0,
      login_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      success: true,
    });
  }
  const { error } = await sb.from("login_logs").insert(records);
  if (error) console.log("login_logs:", error.message);
  else console.log("login_logs: 6 OK");
}

async function seedFornecedorScores(fks) {
  const fornecedores = [
    {
      nome: "Fornecedor Alpha Ltda",
      score: 92.5,
      total_pedidos: 45,
      pedidos_atrasados: 2,
      avaliacao: 4.6,
    },
    {
      nome: "Beta Distribuidora S.A.",
      score: 78.3,
      total_pedidos: 30,
      pedidos_atrasados: 6,
      avaliacao: 3.9,
    },
    {
      nome: "Gamma Importadora ME",
      score: 88.0,
      total_pedidos: 22,
      pedidos_atrasados: 1,
      avaliacao: 4.4,
    },
    {
      nome: "Delta Comercial Eireli",
      score: 65.5,
      total_pedidos: 15,
      pedidos_atrasados: 7,
      avaliacao: 3.3,
    },
    {
      nome: "Epsilon Atacadista",
      score: 95.0,
      total_pedidos: 60,
      pedidos_atrasados: 0,
      avaliacao: 4.8,
    },
  ];

  const records = fornecedores.map((f) => ({
    nome: f.nome,
    score: f.score,
    total_pedidos: f.total_pedidos,
    pedidos_atrasados: f.pedidos_atrasados,
    avaliacao_media: f.avaliacao,
    prazo_medio_dias: Math.floor(Math.random() * 5) + 3,
    taxa_conformidade: Math.round(f.score * 0.95) / 100,
    ultima_avaliacao: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
  }));

  const { error } = await sb.from("fornecedor_scores").insert(records);
  if (error) console.log("fornecedor_scores:", error.message);
  else console.log("fornecedor_scores: 5 OK");
}

async function seedNotificacoes(fks) {
  const ops = fks.profiles;

  const records = [];
  for (let i = 0; i < 5; i++) {
    records.push({
      usuario_id: pick(ops, i).id,
      tipo: pick(["info", "alerta", "sucesso", "erro"], i),
      titulo: `Notificação ${i + 1}`,
      mensagem: `Mensagem de teste para notificação ${i + 1}`,
      lida: i < 2,
      data_leitura: i < 2 ? new Date(Date.now() - i * 3600000).toISOString() : null,
    });
  }
  const { error } = await sb.from("notificacoes").insert(records);
  if (error) console.log("notificacoes:", error.message);
  else console.log("notificacoes: 5 OK");
}

(async () => {
  console.log("=== Seed Outros ===");
  const fks = await getFKs();
  console.log("FKs carregados:", {
    profiles: fks.profiles.length,
    produtos: fks.produtos.length,
    lotes: fks.lotes.length,
    posicoes: fks.posicoes.length,
  });

  await seedAlertasConfig(fks);
  await seedRastreamentoHistorico(fks);
  await seedOrders(fks);
  await seedOrderItems(fks);
  await seedOndasSeparacao(fks);
  await seedTarefas(fks);
  await seedCheckpointsZona(fks);
  await seedCustodiaTransferencias(fks);
  await seedOcorrenciasPerda(fks);
  await seedConquistasDefinicoes(fks);
  await seedConquistasUsuarios(fks);
  await seedRelatoriosAgendados(fks);
  await seedInventarioCiclos(fks);
  await seedAjustesEstoque(fks);
  await seedAuditLog(fks);
  await seedLoginLogs(fks);
  await seedFornecedorScores(fks);
  await seedNotificacoes(fks);

  console.log("\n=== Seed Concluído ===");
})();

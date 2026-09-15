require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const log = (...a) => console.log(...a);

(async () => {
  let ok = 0,
    fail = 0;
  const failLog = (e) => {
    fail++;
    log("  FAIL:", e.message);
  };

  // ========== BUSCAR IDS BASE ==========
  const { data: profiles } = await sb.from("profiles").select("id, email");
  const { data: produtos } = await sb
    .from("produtos")
    .select("id, sku, estoque_minimo, ponto_pedido");
  const { data: lotes } = await sb.from("lotes").select("id, numero_lote, produto_id, status");
  const { data: posicoes } = await sb.from("posicoes_estoque").select("id, codigo, status");

  const opIds = profiles.map((p) => p.id);
  log(
    "Base:",
    profiles.length,
    "profiles,",
    produtos.length,
    "produtos,",
    lotes.length,
    "lotes,",
    posicoes.length,
    "posicoes"
  );

  const hoje = new Date();
  const addH = (h) => new Date(hoje.getTime() - h * 3600000).toISOString();
  const addD = (d) => new Date(hoje.getTime() + d * 86400000).toISOString();

  // ========== 1. ALERTAS_CONFIG ==========
  log("\n1. alertas_config...");
  const configs = [
    {
      tipo: "estoque_baixo",
      threshold: 10,
      ativo: true,
      notificar_email: true,
      notificar_push: true,
    },
    {
      tipo: "vencimento_proximo",
      threshold: 30,
      ativo: true,
      notificar_email: true,
      notificar_push: false,
    },
    {
      tipo: "atraso_entrega",
      threshold: 24,
      ativo: true,
      notificar_email: true,
      notificar_push: true,
    },
    {
      tipo: "divergencia_triagem",
      threshold: 5,
      ativo: true,
      notificar_email: false,
      notificar_push: true,
    },
    {
      tipo: "capacidade_armazenagem",
      threshold: 90,
      ativo: true,
      notificar_email: true,
      notificar_push: true,
    },
  ];
  for (const c of configs) {
    const { error } = await sb.from("alertas_config").insert(c);
    if (error) failLog(error);
    else ok++;
  }

  // ========== 2. NOTIFICACOES ==========
  log("\n2. notificacoes...");
  const notificacoes = [
    {
      user_id: opIds[0],
      tipo: "lote_recebido",
      titulo: "Novo lote recebido",
      mensagem: "Lote LOTE-2026-005 foi recebido",
      lida: false,
    },
    {
      user_id: opIds[1],
      tipo: "triagem_pendente",
      titulo: "Triagem pendente",
      mensagem: "Lote LOTE-2026-007 aguardando triagem",
      lida: false,
    },
    {
      user_id: opIds[2],
      tipo: "divergencia",
      titulo: "Divergencia detectada",
      mensagem: "Diferenca de 5 unidades no LOTE-2026-010",
      lida: true,
    },
    {
      user_id: opIds[3],
      tipo: "estoque_baixo",
      titulo: "Estoque baixo",
      mensagem: "Produto BRINDE-007 abaixo do minimo",
      lida: false,
    },
    {
      user_id: opIds[0],
      tipo: "sistema",
      titulo: "Backup concluido",
      mensagem: "Backup diario realizado com sucesso",
      lida: true,
    },
  ];
  for (const n of notificacoes) {
    const { error } = await sb.from("notificacoes").insert(n);
    if (error) failLog(error);
    else ok++;
  }

  // ========== 3. RASTREAMENTO_HISTORICO ==========
  log("\n3. rastreamento_historico...");
  let rastreamentos = [];
  const eventosRast = ["recebimento", "triagem", "armazenagem", "movimentacao", "expedicao"];
  for (let i = 0; i < 20; i++) {
    const lote = lotes[i % lotes.length];
    const op = opIds[i % opIds.length];
    rastreamentos.push({
      lote_id: lote.id,
      user_id: op,
      tipo_evento: eventosRast[i % eventosRast.length],
      descricao: `${eventosRast[i % eventosRast.length]} do lote ${lote.numero_lote}`,
      created_at: addH(i * 2),
    });
  }
  for (const r of rastreamentos) {
    const { error } = await sb.from("rastreamento_historico").insert(r);
    if (error) failLog(error);
    else ok++;
  }

  // ========== 4. ORDERS (pedidos) ==========
  log("\n4. orders...");
  const orders = [];
  for (let i = 1; i <= 5; i++) {
    orders.push({
      numero_pedido: `PED-2026-${String(i).padStart(4, "0")}`,
      cliente_nome: [
        "Tech Solutions LTDA",
        "Indústria ABC",
        "Comércio XYZ",
        "Distribuidora Norte",
        "Empresa Sul",
      ][i - 1],
      status: ["pendente", "em_separacao", "em_separacao", "faturado", "enviado"][i - 1],
      data_pedido: addD(-i * 2),
      valor_total: 1500 * i + 500,
      prioridade: ["normal", "alta", "normal", "urgente", "normal"][i - 1],
    });
  }
  const { data: insertedOrders } = await sb.from("orders").insert(orders).select();
  if (!insertedOrders) failLog(new Error("orders"));
  else {
    ok += insertedOrders.length;
    log("  ", insertedOrders.length, "orders");
  }

  // ========== 5. ORDER_ITEMS ==========
  log("\n5. order_items...");
  if (insertedOrders) {
    const items = [];
    for (const order of insertedOrders) {
      for (let j = 0; j < 3; j++) {
        const prod = produtos[(order.numero_pedido.charCodeAt(11) + j) % produtos.length];
        items.push({
          order_id: order.id,
          produto_id: prod.id,
          quantidade: 10 + j * 5,
          preco_unitario: 25.5 + j * 10,
        });
      }
    }
    const { data: ins, error } = await sb.from("order_items").insert(items).select();
    if (error) failLog(error);
    else {
      ok += ins.length;
      log("  ", ins.length, "order_items");
    }
  }

  // ========== 6. ROMANEIOS ==========
  log("\n6. romaneios...");
  const romaneios = [];
  const statusR = ["em_separacao", "em_separacao", "conferido", "expedido", "entregue"];
  for (let i = 1; i <= 5; i++) {
    romaneios.push({
      numero_romaneio: `ROM-2026-${String(i).padStart(4, "0")}`,
      status: statusR[i - 1],
      transportadora: [
        "Correios",
        "Transportadora Rapido",
        "LogExpress",
        "BrasPress",
        "Total Express",
      ][i - 1],
      destino: [
        "Sao Paulo - SP",
        "Rio de Janeiro - RJ",
        "Belo Horizonte - MG",
        "Porto Alegre - RS",
        "Curitiba - PR",
      ][i - 1],
      data_previsao: addD(i),
      created_by: opIds[i % opIds.length],
    });
  }
  const { data: insRom } = await sb.from("romaneios").insert(romaneios).select();
  if (!insRom) failLog(new Error("romaneios"));
  else {
    ok += insRom.length;
    log("  ", insRom.length, "romaneios");
  }

  // ========== 7. ROMANEIO_ITENS ==========
  log("\n7. romaneio_itens...");
  if (insRom) {
    const itens = [];
    for (const rom of insRom) {
      for (let j = 0; j < 4; j++) {
        const prod = produtos[j % produtos.length];
        itens.push({
          romaneio_id: rom.id,
          produto_id: prod.id,
          quantidade: 8 + j * 4,
          separado: j < 2,
        });
      }
    }
    const { data: ins, error } = await sb.from("romaneio_itens").insert(itens).select();
    if (error) failLog(error);
    else {
      ok += ins.length;
      log("  ", ins.length, "romaneio_itens");
    }
  }

  // ========== 8. ONDAS_SEPARACAO ==========
  log("\n8. ondas_separacao...");
  const ondas = [];
  for (let i = 1; i <= 3; i++) {
    ondas.push({
      numero_onda: `ONDA-${String(i).padStart(3, "0")}`,
      status: ["planejada", "em_execucao", "concluida"][i - 1],
      data_programada: addD(i),
      responsavel_id: opIds[i % opIds.length],
      prioridade: ["normal", "alta", "normal"][i - 1],
    });
  }
  const { data: insOndas } = await sb.from("ondas_separacao").insert(ondas).select();
  if (!insOndas) failLog(new Error("ondas"));
  else {
    ok += insOndas.length;
    log("  ", insOndas.length, "ondas");
  }

  // ========== 9. TAREFAS ==========
  log("\n9. tarefas...");
  const tarefas = [];
  const statusT = [
    "pendente",
    "em_andamento",
    "concluida",
    "pendente",
    "em_andamento",
    "concluida",
    "pendente",
    "cancelada",
  ];
  for (let i = 0; i < 12; i++) {
    const prod = produtos[i % produtos.length];
    const lote = lotes[i % lotes.length];
    tarefas.push({
      tipo: ["recebimento", "triagem", "armazenagem", "separacao", "inventario"][i % 5],
      status: statusT[i],
      titulo: `Tarefa #${i + 1} - ${prod.sku}`,
      descricao: `Processar ${prod.sku} do lote ${lote.numero_lote}`,
      produto_id: prod.id,
      lote_id: lote.id,
      assigned_to: opIds[i % opIds.length],
      created_by: opIds[(i + 1) % opIds.length],
      prazo: addH(-i * 3),
    });
  }
  const { data: insT, error: eT } = await sb.from("tarefas").insert(tarefas).select();
  if (eT) failLog(eT);
  else {
    ok += insT.length;
    log("  ", insT.length, "tarefas");
  }

  // ========== 10. GOVERNANCA - CHECKPOINTS_ZONA ==========
  log("\n10. checkpoints_zona...");
  const zonas = ["RECEBIMENTO", "ARMAZENAGEM", "EXPEDICAO", "TRIAGEM"];
  const cps = [];
  for (const z of zonas) {
    cps.push({
      zona: z,
      nome: `Checkpoint ${z}`,
      descricao: `Ponto de controle de custodia da zona ${z}`,
      ativo: true,
    });
  }
  const { data: insCp } = await sb.from("checkpoints_zona").insert(cps).select();
  if (!insCp) failLog(new Error("checkpoints"));
  else {
    ok += insCp.length;
    log("  ", insCp.length, "checkpoints");
  }

  // ========== 11. CUSTODIA_TRANSFERENCIAS ==========
  log("\n11. custodia_transferencias...");
  if (insCp) {
    const cust = [];
    for (let i = 0; i < 5; i++) {
      cust.push({
        lote_id: lotes[i % lotes.length].id,
        checkpoint_origem_id: insCp[i % insCp.length].id,
        checkpoint_destino_id: insCp[(i + 1) % insCp.length].id,
        responsavel_origem_id: opIds[i % opIds.length],
        responsavel_destino_id: opIds[(i + 1) % opIds.length],
        data_transferencia: addH(i * 4),
        observacoes: `Transferencia ${i + 1} entre zonas`,
      });
    }
    const { data: insC, error: eC } = await sb
      .from("custodia_transferencias")
      .insert(cust)
      .select();
    if (eC) failLog(eC);
    else {
      ok += insC.length;
      log("  ", insC.length, "custodias");
    }
  }

  // ========== 12. OCORRENCIAS_PERDA ==========
  log("\n12. ocorrencias_perda...");
  const ocorrencias = [
    {
      tipo: "avaria",
      gravidade: "media",
      descricao: "Caixa danificada no transporte",
      produto_id: produtos[0].id,
      lote_id: lotes[0].id,
      responsavel_id: opIds[1],
    },
    {
      tipo: "extravio",
      gravidade: "alta",
      descricao: "Item nao localizado no inventario",
      produto_id: produtos[3].id,
      lote_id: lotes[3].id,
      responsavel_id: opIds[2],
    },
    {
      tipo: "vencimento",
      gravidade: "baixa",
      descricao: "Produto proximo ao vencimento",
      produto_id: produtos[7].id,
      lote_id: lotes[7].id,
      responsavel_id: opIds[0],
    },
  ];
  for (const o of ocorrencias) {
    const { error } = await sb.from("ocorrencias_perda").insert(o);
    if (error) failLog(error);
    else ok++;
  }

  // ========== 13. CONQUISTAS_DEFINICOES ==========
  log("\n13. conquistas_definicoes...");
  const conquistasDefs = [
    {
      codigo: "PRIMEIRA_TRIAGEM",
      nome: "Primeira Triagem",
      descricao: "Complete sua primeira triagem",
      icone: "trophy",
      xp_recompensa: 50,
      criterio_tipo: "triagens",
      criterio_valor: 1,
    },
    {
      codigo: "TRIADOR_BRONZE",
      nome: "Triador Bronze",
      descricao: "Complete 10 triagens",
      icone: "medal",
      xp_recompensa: 100,
      criterio_tipo: "triagens",
      criterio_valor: 10,
    },
    {
      codigo: "TRIADOR_PRATA",
      nome: "Triador Prata",
      descricao: "Complete 50 triagens",
      icone: "medal",
      xp_recompensa: 250,
      criterio_tipo: "triagens",
      criterio_valor: 50,
    },
    {
      codigo: "TRIADOR_OURO",
      nome: "Triador Ouro",
      descricao: "Complete 100 triagens",
      icone: "crown",
      xp_recompensa: 500,
      criterio_tipo: "triagens",
      criterio_valor: 100,
    },
    {
      codigo: "ZERO_DIVERGENCIAS",
      nome: "Zero Divergencias",
      descricao: "Mes sem divergencias",
      icone: "shield",
      xp_recompensa: 300,
      criterio_tipo: "divergencias",
      criterio_valor: 0,
    },
    {
      codigo: "ACURACIDADE_100",
      nome: "Acuracidade 100%",
      descricao: "100% de acuracidade em triagens",
      icone: "target",
      xp_recompensa: 200,
      criterio_tipo: "acuracidade",
      criterio_valor: 100,
    },
    {
      codigo: "VELOCISTA",
      nome: "Velocista",
      descricao: "Triagem em menos de 5 min",
      icone: "zap",
      xp_recompensa: 75,
      criterio_tipo: "velocidade",
      criterio_valor: 300,
    },
  ];
  const { data: insConq, error: eConq } = await sb
    .from("conquistas_definicoes")
    .insert(conquistasDefs)
    .select();
  if (eConq) failLog(eConq);
  else {
    ok += insConq.length;
    log("  ", insConq.length, "conquistas_def");
  }

  // ========== 14. CONQUISTAS_USUARIOS ==========
  log("\n14. conquistas_usuarios...");
  if (insConq) {
    const cqUsr = [];
    for (let i = 0; i < 4; i++) {
      const op = opIds[i % opIds.length];
      const cq = insConq[i % insConq.length];
      cqUsr.push({ conquista_id: cq.id, user_id: op, data_conquista: addH(i * 12) });
    }
    const { data: ins, error } = await sb.from("conquistas_usuarios").insert(cqUsr).select();
    if (error) failLog(error);
    else {
      ok += ins.length;
      log("  ", ins.length, "conquistas_usuarios");
    }
  }

  // ========== 15. RELATORIOS_AGENDADOS ==========
  log("\n15. relatorios_agendados...");
  const relatorios = [
    {
      nome: "Inventario Diario",
      tipo: "inventario",
      periodicidade: "diaria",
      ativo: true,
      criado_por: opIds[0],
    },
    {
      nome: "Movimentacao Semanal",
      tipo: "movimentacao",
      periodicidade: "semanal",
      ativo: true,
      criado_por: opIds[3],
    },
    {
      nome: "Divergencias Mensais",
      tipo: "divergencias",
      periodicidade: "mensal",
      ativo: true,
      criado_por: opIds[3],
    },
  ];
  for (const r of relatorios) {
    const { error } = await sb.from("relatorios_agendados").insert(r);
    if (error) failLog(error);
    else ok++;
  }

  // ========== 16. INVENTARIO_CICLOS ==========
  log("\n16. inventario_ciclos...");
  const ciclos = [
    {
      nome: "Ciclo A - Agosto 2026",
      status: "em_andamento",
      tipo: "geral",
      data_inicio: addD(-5),
      data_fim: addD(5),
      responsavel_id: opIds[3],
    },
    {
      nome: "Ciclo B - Curva A",
      status: "planejado",
      tipo: "curva_abc",
      data_inicio: addD(7),
      data_fim: addD(14),
      responsavel_id: opIds[3],
    },
  ];
  const { data: insCic, error: eCic } = await sb.from("inventario_ciclos").insert(ciclos).select();
  if (eCic) failLog(eCic);
  else {
    ok += insCic.length;
    log("  ", insCic.length, "ciclos");
  }

  // ========== 17. AJUSTES_ESTOQUE ==========
  log("\n17. ajustes_estoque...");
  for (let i = 0; i < 4; i++) {
    const prod = produtos[i % produtos.length];
    const { error } = await sb.from("ajustes_estoque").insert({
      produto_id: prod.id,
      tipo: ["positivo", "negativo", "transferencia", "inventario"][i],
      quantidade: [10, -5, 15, -2][i],
      motivo: [
        "Correcao de contagem",
        "Quebra identificada",
        "Transferencia entre zonas",
        "Ajuste de inventario",
      ][i],
      user_id: opIds[i % opIds.length],
    });
    if (error) failLog(error);
    else ok++;
  }

  // ========== 18. AUDIT_LOG ==========
  log("\n18. audit_log...");
  const acoes = ["login", "logout", "create", "update", "delete"];
  const tabelasLog = ["produtos", "lotes", "posicoes_estoque", "eventos_triagem"];
  for (let i = 0; i < 8; i++) {
    const op = opIds[i % opIds.length];
    const ac = acoes[i % acoes.length];
    const tab = tabelasLog[i % tabelasLog.length];
    const { error } = await sb.from("audit_log").insert({
      user_id: op,
      acao: ac,
      tabela: tab,
      registro_id: "00000000-0000-0000-0000-00000000000" + i,
      dados_anteriores: ac === "update" || ac === "delete" ? { valor_antigo: 100 } : null,
      dados_novos: ac === "create" || ac === "update" ? { valor_novo: 150 } : null,
      ip_address: "192.168.1." + (i + 10),
    });
    if (error) failLog(error);
    else ok++;
  }

  // ========== 19. ROLE_PERMISSIONS ==========
  log("\n19. role_permissions...");
  const { data: perms } = await sb.from("permissions").select("id, code").limit(20);
  if (perms?.length) {
    const rp = [];
    for (const role of ["admin", "supervisor", "operador"]) {
      for (const p of perms) {
        rp.push({
          role,
          permission_id: p.id,
          granted:
            role === "admin"
              ? true
              : role === "supervisor"
                ? p.code.startsWith("view") || p.code.startsWith("create")
                : p.code.startsWith("view"),
        });
      }
    }
    const { data: ins, error } = await sb.from("role_permissions").insert(rp).select();
    if (error) failLog(error);
    else {
      ok += ins.length;
      log("  ", ins.length, "role_permissions");
    }
  }

  // ========== 20. LOGIN_LOGS ==========
  log("\n20. login_logs...");
  for (let i = 0; i < 6; i++) {
    const op = opIds[i % opIds.length];
    const { error } = await sb.from("login_logs").insert({
      user_id: op,
      ip_address: "192.168.1." + (i + 20),
      user_agent: "Mozilla/5.0 Chrome",
      sucesso: i !== 3,
    });
    if (error) failLog(error);
    else ok++;
  }

  // ========== 21. FORNECEDOR_SCORES ==========
  log("\n21. fornecedor_scores...");
  const fornecedores = [
    "Fornecedor Brindes LTDA",
    "Artigos Promocionais ABC",
    "Distribuidora Brasil",
    "Importadora Express",
    "Creative Gifts",
  ];
  for (let i = 0; i < fornecedores.length; i++) {
    const { error } = await sb.from("fornecedor_scores").insert({
      fornecedor_nome: fornecedores[i],
      pontualidade: 80 + i * 3,
      qualidade: 75 + i * 4,
      preco_competitivo: 70 + i * 5,
      score_geral: 75 + i * 4,
      total_entregas: 10 + i * 3,
    });
    if (error) failLog(error);
    else ok++;
  }

  log("\n=== RESUMO FINAL ===");
  log("OK:", ok, "FAIL:", fail);

  const tabelasFinais = [
    "alertas_config",
    "notificacoes",
    "rastreamento_historico",
    "orders",
    "order_items",
    "romaneios",
    "romaneio_itens",
    "ondas_separacao",
    "tarefas",
    "checkpoints_zona",
    "custodia_transferencias",
    "ocorrencias_perda",
    "conquistas_definicoes",
    "conquistas_usuarios",
    "relatorios_agendados",
    "inventario_ciclos",
    "ajustes_estoque",
    "audit_log",
    "role_permissions",
    "login_logs",
    "fornecedor_scores",
  ];
  for (const t of tabelasFinais) {
    const { count } = await sb.from(t).select("*", { count: "exact", head: true });
    log((t + " ").padEnd(30), "=>", count);
  }
})();

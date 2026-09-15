require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function insert(table, records) {
  if (!records.length) return;
  const { error } = await sb.from(table).insert(records);
  if (error) console.log(`${table}: ${error.message}`);
  else console.log(`${table}: ${records.length} OK`);
}

(async () => {
  await sb.from("metricas_operacionais").delete().gte("data", "1900-01-01");
  await sb.from("metas_kpi").delete().like("metrica", "kpi_%");

  // Limpa metas_seed (não conflitar se rodado antes)
  await sb.from("metas_kpi").delete().like("nome", "META-%");

  // METAS
  const metas = [
    {
      nome: "META-TaxaAprovacao",
      descricao: "Taxa mínima de aprovação de itens triados",
      tipo: "percentual",
      metrica: "kpi_taxa_aprovacao",
      valor_meta: 95,
      unidade: "%",
    },
    {
      nome: "META-AcuracidadePicking",
      descricao: "Acuracidade mínima de picking",
      tipo: "percentual",
      metrica: "kpi_acuracidade_picking",
      valor_meta: 99.5,
      unidade: "%",
    },
    {
      nome: "META-TempoTriagem",
      descricao: "Tempo médio de triagem por item",
      tipo: "tempo",
      metrica: "kpi_tempo_medio_triagem",
      valor_meta: 3,
      unidade: "min",
    },
    {
      nome: "META-TaxaOcupacao",
      descricao: "Taxa mínima de ocupação do armazém",
      tipo: "percentual",
      metrica: "kpi_taxa_ocupacao",
      valor_meta: 80,
      unidade: "%",
    },
    {
      nome: "META-ItensTriados",
      descricao: "Meta diária de itens triados",
      tipo: "quantidade",
      metrica: "kpi_itens_triados",
      valor_meta: 500,
      unidade: "un",
    },
    {
      nome: "META-PedidosSeparados",
      descricao: "Meta diária de pedidos separados",
      tipo: "quantidade",
      metrica: "kpi_pedidos_separados",
      valor_meta: 80,
      unidade: "pedidos",
    },
    {
      nome: "META-VolumesRecebidos",
      descricao: "Meta diária de volumes recebidos",
      tipo: "quantidade",
      metrica: "kpi_volumes_recebidos",
      valor_meta: 100,
      unidade: "vol",
    },
  ];
  await insert("metas_kpi", metas);

  // MÉTRICAS DIÁRIAS (últimos 30 dias)
  const metrics = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * 86400 * 1000);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseReduction = isWeekend ? 0.3 : 1.0;
    const trend = 1 + (30 - i) * 0.01;
    const itens = Math.floor((500 + Math.random() * 200) * baseReduction * trend);
    const rep = Math.floor(Math.random() * 20);
    const apr = itens - rep;
    const tempoTotal = itens * (2 + Math.random() * 1.5);
    const tempoMedio = tempoTotal / Math.max(itens, 1);
    const taxaApr = (apr / Math.max(itens, 1)) * 100;
    const pedidos = Math.floor((50 + Math.random() * 30) * baseReduction * trend);
    const itensSep = pedidos * (5 + Math.floor(Math.random() * 3));
    const errosPck = Math.floor(Math.random() * 5);
    const acuracidade = 100 - (errosPck / Math.max(itensSep, 1)) * 100;
    const tempoPck = itensSep * (1.5 + Math.random());
    const posTot = 88;
    const posOcup = Math.floor(55 + Math.random() * 15);
    const taxaOcup = (posOcup / posTot) * 100;
    const volumes = Math.floor((60 + Math.random() * 40) * baseReduction * trend);
    const nfs = Math.floor((8 + Math.random() * 5) * baseReduction);
    const tempoRec = 20 + Math.random() * 20;
    const movs = Math.floor((150 + Math.random() * 80) * baseReduction * trend);
    metrics.push({
      data: dateStr,
      itens_triados: itens,
      tempo_total_triagem_minutos: Math.round(tempoTotal),
      tempo_medio_triagem_minutos: +tempoMedio.toFixed(2),
      itens_aprovados: apr,
      itens_reprovados: rep,
      taxa_aprovacao: +taxaApr.toFixed(2),
      pedidos_separados: pedidos,
      itens_separados: itensSep,
      erros_picking: errosPck,
      acuracidade_picking: +acuracidade.toFixed(2),
      tempo_total_picking_minutos: Math.round(tempoPck),
      posicoes_totais: posTot,
      posicoes_ocupadas: posOcup,
      taxa_ocupacao: +taxaOcup.toFixed(2),
      volumes_recebidos: volumes,
      nfs_processadas: nfs,
      tempo_medio_recebimento_minutos: +tempoRec.toFixed(2),
      movimentacoes_realizadas: movs,
    });
  }
  await insert("metricas_operacionais", metrics);

  console.log("=== Concluído ===");
})();

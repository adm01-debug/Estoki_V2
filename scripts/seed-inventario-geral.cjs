require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  await sb.from("inventario_contagens").delete().gte("created_at", "1900-01-01");

  const prods = (await sb.from("produtos").select("id, sku")).data || [];
  const lots = (await sb.from("lotes").select("id, produto_id, quantidade_atual")).data || [];
  const posicoes = (await sb.from("posicoes_estoque").select("id")).data || [];
  const ciclos = (await sb.from("inventario_ciclos").select("id, total_posicoes")).data || [];
  const users = (await sb.from("profiles").select("id")).data || [];
  if (prods.length === 0 || posicoes.length === 0 || users.length === 0 || ciclos.length === 0) {
    console.log("Faltam dados base (prods/posicoes/users/ciclos)");
    return;
  }

  const statusCycle = ["pendente", "em_andamento", "concluido", "divergencia"];
  const ciclo = ciclos[0];
  const contador = users[0].id;

  const records = [];
  for (let i = 0; i < 40; i++) {
    const prod = prods[i % prods.length];
    const lotesProd = lots.filter((l) => l.produto_id === prod.id && l.quantidade_atual > 0);
    const lote = lotesProd[i % Math.max(lotesProd.length, 1)] || lots[i % lots.length];
    const expected = lote?.quantidade_atual || 100;
    const temDivergencia = Math.random() < 0.35;
    const counted = temDivergencia
      ? Math.max(0, expected + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 8)))
      : expected;
    const status = temDivergencia ? "divergencia" : statusCycle[i % statusCycle.length];
    const pos = posicoes[i % posicoes.length];
    const offset = new Date(Date.now() - i * 3600 * 1000).toISOString();
    records.push({
      ciclo_id: ciclo.id,
      produto_id: prod.id,
      lote_id: lote?.id,
      posicao_id: pos.id,
      quantidade_sistema: expected,
      quantidade_contada: counted,
      contado_por: contador,
      data_contagem: offset,
      status,
    });
  }
  const { error } = await sb.from("inventario_contagens").insert(records);
  if (error) console.log("inventario_contagens:", error.message);
  else console.log("inventario_contagens:", records.length, "OK");

  // Atualiza ciclo com totais
  const totalPosicoes = posicoes.length;
  const contadas = records.length;
  const div = records.filter((r) => r.status === "divergencia").length;
  await sb
    .from("inventario_ciclos")
    .update({
      total_posicoes: totalPosicoes,
      posicoes_contadas: contadas,
      divergencias_encontradas: div,
      data_inicio: new Date(Date.now() - 86400000).toISOString(),
      status: contadas >= totalPosicoes ? "concluido" : "em_andamento",
    })
    .eq("id", ciclo.id);
  console.log("ciclo atualizado");

  console.log("=== Concluído ===");
})();

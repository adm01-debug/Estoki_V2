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
  // Reset putaway-related rows so we don't pile duplicates on re-runs
  await sb.from("tarefas").delete().eq("tipo", "armazenagem");
  await sb.from("posicoes_estoque").delete().like("codigo", "PW%");
  await sb.from("posicoes_estoque").delete().like("codigo", "PWBL-%");
  await sb.from("posicoes_estoque").delete().like("codigo", "PWBX-%");

  const prods = (await sb.from("produtos").select("id, nome, sku")).data || [];
  const users = (await sb.from("profiles").select("id, nome")).data || [];
  if (prods.length === 0) {
    console.log("Sem produtos — abortando");
    return;
  }
  const op = users[0]?.id;

  // Positions
  const posicoes = [];
  const zonas = ["A", "B", "C"];
  for (const z of zonas) {
    for (let s = 1; s <= 3; s++) {
      for (let n = 1; n <= 4; n++) {
        for (let b = 1; b <= 2; b++) {
          posicoes.push({
            codigo: `PW${z}-S${String(s).padStart(2, "0")}-N${n}-B${b}`,
            tipo: "porta_palete",
            porta_palete: `PW${z}-${String(s).padStart(2, "0")}`,
            secao: `S${String(s).padStart(2, "0")}`,
            nivel: `N${n}`,
            box: `B${b}`,
            status: "livre",
            zona: z,
            capacidade_kg: 500,
          });
        }
      }
    }
  }
  for (let i = 1; i <= 8; i++) {
    posicoes.push({
      codigo: `PWBL-${String(i).padStart(2, "0")}`,
      tipo: "box",
      secao: `BL`,
      nivel: "1",
      box: `B${i}`,
      status: "livre",
      zona: "D",
      capacidade_kg: 200,
    });
  }
  for (let i = 1; i <= 6; i++) {
    posicoes.push({
      codigo: `PWBX-${String(i).padStart(2, "0")}`,
      tipo: "box",
      secao: "EXP",
      nivel: "1",
      box: `X${i}`,
      status: "livre",
      zona: "E",
      capacidade_kg: 50,
    });
  }
  posicoes.push({ codigo: "PW-RECEB", tipo: "box", secao: "RCB", status: "livre", zona: "A" });
  posicoes.push({ codigo: "PW-TRIAG", tipo: "box", secao: "TRG", status: "livre", zona: "A" });
  await insert("posicoes_estoque", posicoes);

  const pos = (await sb.from("posicoes_estoque").select("id, codigo, tipo")).data || [];
  const destinos = pos.filter((p) => p.codigo.startsWith("PW") && !p.codigo.startsWith("PW-"));
  const origens = pos.filter((p) => p.codigo === "PW-RECEB" || p.codigo === "PW-TRIAG");

  // Tarefas de armazenagem (Putaway)
  const tarefas = [];
  const statusCycle = [
    "pendente",
    "pendente",
    "pendente",
    "atribuida",
    "em_andamento",
    "concluida",
    "concluida",
  ];
  const prioridadeCycle = ["alta", "media", "media", "baixa", "urgente", "alta"];
  const tiposPalete = ["padrão", "meio palete", "palete alto", "caixa fechada"];
  for (let i = 0; i < 30; i++) {
    const destino = destinos[i % destinos.length];
    const origem = origens[i % origens.length];
    const prod = prods[i % prods.length];
    const qty = 10 + (i % 6) * 8;
    const status = statusCycle[i % statusCycle.length];
    const prioridade = prioridadeCycle[i % prioridadeCycle.length];
    const offset = new Date(Date.now() - i * 1800 * 1000).toISOString();
    tarefas.push({
      tipo: "armazenagem",
      status,
      prioridade,
      produto_id: prod.id,
      posicao_origem_id: origem.id,
      posicao_destino_id: destino.id,
      quantidade: qty,
      quantidade_executada:
        status === "concluida" ? qty : status === "em_andamento" ? Math.floor(qty / 2) : 0,
      operador_id: op,
      zona: destino.zona,
      created_at: offset,
      updated_at: offset,
    });
  }
  await insert("tarefas", tarefas);

  console.log("=== Concluído ===");
})();

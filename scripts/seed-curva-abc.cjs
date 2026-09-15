require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  const prods = (await sb.from("produtos").select("id, nome")).data || [];
  if (prods.length === 0) {
    console.log("Sem produtos");
    return;
  }

  // Distribuição ABC:
  //   A: top 20% — giro alto (>100), alto valor
  //   B: 30% — giro médio (30-100)
  //   C: 50% — giro baixo (<30)
  const n = prods.length;
  const aCount = Math.ceil(n * 0.2);
  const bCount = Math.ceil(n * 0.3);

  // Valor unitario ficticio por classe (o hook usa valor_total = quantidade_estoque * valor_unitario)
  const valorUnitario = (idx) => {
    if (idx < aCount) return 80 + (aCount - idx) * 30;
    if (idx < aCount + bCount) return 25 + (aCount + bCount - idx) * 10;
    return 5 + Math.floor(Math.random() * 8);
  };

  let updated = 0;
  for (let i = 0; i < n; i++) {
    let classe, giro;
    if (i < aCount) {
      classe = "A";
      giro = 100 + (aCount - i) * 15 + Math.floor(Math.random() * 30);
    } else if (i < aCount + bCount) {
      classe = "B";
      giro = 30 + Math.floor(Math.random() * 60);
    } else {
      classe = "C";
      giro = Math.floor(Math.random() * 25);
    }
    const { error } = await sb
      .from("produtos")
      .update({ giro_mensal: giro, curva_abc: classe, peso_unitario: valorUnitario(i) })
      .eq("id", prods[i].id);
    if (!error) updated++;
  }
  console.log(`produtos: ${updated} OK`);

  // Gerar mais movimentações de saída (saida_transporte e separacao) para reforçar o cálculo de giro
  const users = (await sb.from("profiles").select("id")).data || [];
  const op = users[0]?.id;
  const records = [];
  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < 200; i++) {
    // Pondera: produtos A recebem muito mais saídas
    let prodIdx;
    const r = Math.random();
    if (r < 0.6) prodIdx = Math.floor(Math.random() * aCount);
    else if (r < 0.85) prodIdx = aCount + Math.floor(Math.random() * bCount);
    else prodIdx = aCount + bCount + Math.floor(Math.random() * (n - aCount - bCount));
    prodIdx = Math.min(prodIdx, n - 1);
    const tipo = i % 2 === 0 ? "saida_transporte" : "separacao";
    const qty = Math.floor(Math.random() * 50) + 5;
    const dayOffset = Math.floor(Math.random() * 30);
    const offset = new Date(now - dayOffset * 86400 * 1000).toISOString();
    records.push({
      produto_id: prods[prodIdx].id,
      tipo_evento: tipo,
      quantidade: qty,
      descricao: `Saída #${counter++} - ${tipo}`,
      operador_id: op,
      created_at: offset,
    });
  }
  // Insert em lotes de 50
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    const { error } = await sb.from("rastreamento_historico").insert(batch);
    if (error) console.log(`rastreamento_historico batch ${i / 50 + 1}: ${error.message}`);
    else console.log(`rastreamento_historico batch ${i / 50 + 1}: ${batch.length} OK`);
  }
  console.log("=== Concluído ===");
}
run();

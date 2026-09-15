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
  await sb.from("lotes").delete().like("numero_lote", "CONF-%");

  const prods = (await sb.from("produtos").select("id, nome, sku")).data || [];
  if (prods.length === 0) {
    console.log("Sem produtos — abortando");
    return;
  }

  const fornecedores = [
    "Brilho Gráfica Ltda",
    "Textil Premium S.A.",
    "Plásticos Brasil Eireli",
    "Metalúrgica União ME",
    "Print Visual Comunicação",
    "Indústria Criativa Ltda",
    "Mochileiros Brasil Confecções",
    "Canetas & Cia Distribuidora",
  ];
  const statusCycle = [
    "aguardando",
    "aguardando",
    "aguardando",
    "em_transito",
    "recebido",
    "em_conferencia",
    "conferido",
    "divergencia",
  ];
  const nfs = [
    "NF-00123456",
    "NF-00123457",
    "NF-00123458",
    "NF-00123459",
    "NF-00123460",
    "NF-00123461",
    "NF-00123462",
    "NF-00123463",
  ];

  const records = [];
  const now = Date.now();
  for (let i = 0; i < 25; i++) {
    const prod = prods[i % prods.length];
    const qty = 100 + (i % 8) * 50;
    const status = statusCycle[i % statusCycle.length];
    const fornecedor = fornecedores[i % fornecedores.length];
    const nf = nfs[i % nfs.length];
    const fab = new Date(now - i * 86400 * 1000 * 3).toISOString().slice(0, 10);
    const val = new Date(now + (i * 86400 * 1000 * 30 + 86400 * 1000 * 365))
      .toISOString()
      .slice(0, 10);
    const prev = new Date(now - i * 86400 * 1000).toISOString().slice(0, 10);
    const offset = new Date(now - i * 3600 * 1000).toISOString();
    records.push({
      produto_id: prod.id,
      numero_lote: `CONF-${String(200000 + i).padStart(6, "0")}`,
      data_fabricacao: fab,
      data_validade: val,
      data_recebimento: offset,
      quantidade_inicial: qty,
      quantidade_atual: status === "conferido" ? qty : 0,
      quantidade_pedida: qty,
      nf_entrada: nf,
      fornecedor,
      previsao_chegada: prev,
      status,
    });
  }
  await insert("lotes", records);

  console.log("=== Concluído ===");
})();

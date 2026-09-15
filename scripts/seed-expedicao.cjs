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
  await sb.from("romaneios").delete().like("codigo", "EXP-%");

  const users = (await sb.from("profiles").select("id, nome")).data || [];
  const op = users[0]?.id;

  const motoristas = [
    { nome: "João Carlos Silva", placa: "ABC1D23", tipo: "Caminhão Toco" },
    { nome: "Maria Aparecida Souza", placa: "DEF4G56", tipo: "Van" },
    { nome: "Roberto Almeida", placa: "GHI7J89", tipo: "Carreta" },
    { nome: "Carlos Mendes", placa: "JKL1M34", tipo: "Caminhão 3/4" },
    { nome: "Ana Paula Ferreira", placa: "MNO5P67", tipo: "Van Refrigerada" },
    { nome: "Pedro Henrique Costa", placa: "PQR8S90", tipo: "Caminhão Toco" },
    { nome: "Lucas Oliveira", placa: "STU2V34", tipo: "Carreta LS" },
    { nome: "Fernanda Lima", placa: "VWX5Y67", tipo: "Van" },
  ];
  const rotas = [
    "São Paulo → Rio de Janeiro",
    "São Paulo → Belo Horizonte",
    "São Paulo → Curitiba",
    "São Paulo → Porto Alegre",
    "São Paulo → Salvador",
    "São Paulo → Brasília",
    "São Paulo → Campinas",
    "São Paulo → Recife",
    "São Paulo → Fortaleza",
    "São Paulo → Manaus",
  ];
  const statusCycle = [
    "rascunho",
    "confirmado",
    "confirmado",
    "em_transito",
    "em_transito",
    "parcial",
    "entregue",
    "cancelado",
  ];

  const records = [];
  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    const mot = motoristas[i % motoristas.length];
    const rota = rotas[i % rotas.length];
    const status = statusCycle[i % statusCycle.length];
    const volumes = 5 + (i % 8);
    const peso = 200 + (i % 15) * 50;
    const entregas = volumes;
    const realizadas =
      status === "entregue"
        ? volumes
        : status === "parcial"
          ? Math.floor(volumes * 0.6)
          : status === "em_transito"
            ? Math.floor(volumes * 0.3)
            : 0;
    const previsao = new Date(now + i * 86400 * 1000).toISOString();
    const saida = ["em_transito", "parcial", "entregue"].includes(status)
      ? new Date(now - i * 3600 * 1000).toISOString()
      : null;
    const retorno =
      status === "entregue" ? new Date(now - i * 3600 * 1000 + 86400 * 1000).toISOString() : null;
    const offset = new Date(now - i * 1800 * 1000).toISOString();
    records.push({
      codigo: `EXP-${String(300000 + i).padStart(6, "0")}`,
      data_criacao: offset,
      data_prevista_entrega: previsao,
      data_saida: saida,
      data_retorno: retorno,
      status,
      motorista: mot.nome,
      placa_veiculo: mot.placa,
      tipo_veiculo: mot.tipo,
      rota,
      observacoes: i % 4 === 0 ? `Cliente VIP - entrega agendada com ${mot.nome}` : null,
      total_volumes: volumes,
      total_peso_kg: peso,
      total_entregas: entregas,
      entregas_realizadas: realizadas,
      responsavel_id: op,
    });
  }
  await insert("romaneios", records);

  console.log("=== Concluído ===");
})();

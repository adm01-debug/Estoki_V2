require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  // pegar primeiros profiles pra usar como FK
  const { data: profs } = await sb.from("profiles").select("id").limit(1);
  const { data: prods } = await sb.from("produtos").select("id").limit(1);
  const pid = profs[0].id,
    prodId = prods[0].id;

  const tentativas = [
    ["alertas_config", { tipo: "estoque_baixo", mensagem: "TEST", limite: 10, ativo: true }],
    ["rastreamento_historico", { tipo_evento: "recebimento", descricao: "TEST" }],
    ["orders", { codigo: "TEST-" + Date.now(), cliente_nome: "TESTE" }],
    ["checkpoints_zona", { zona: "TEST", operador_id: pid }],
    ["ocorrencias_perda", { codigo: "TEST-" + Date.now(), reportado_por: pid }],
    ["conquistas_definicoes", { codigo: "TEST-" + Date.now(), nome: "TEST", xp_recompensa: 50 }],
    ["relatorios_agendados", { nome: "TEST", tipo: "inventario", periodicidade: "diaria" }],
    ["inventario_ciclos", { nome: "TEST", data_agendada: new Date().toISOString() }],
    [
      "ajustes_estoque",
      { produto_id: prodId, quantidade_anterior: 100, quantidade_nova: 90, motivo: "TEST" },
    ],
    ["audit_log", { entity_type: "produto", entity_id: prodId, action: "create" }],
    ["romaneio_itens", { cliente: "TEST", produto_id: prodId, quantidade: 5 }],
  ];

  for (const [t, payload] of tentativas) {
    const { data, error } = await sb.from(t).insert(payload).select();
    if (error) {
      console.log(t, "=> ERRO:", error.message);
    } else if (data?.[0]) {
      console.log(t, "\n  ", Object.keys(data[0]).join(", "));
      await sb.from(t).delete().eq("id", data[0].id);
    }
  }
})();

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
  await sb.from("trocas_devolucoes").delete().like("pedido", "PED-TD-%");

  const prods = (await sb.from("produtos").select("id, nome, sku")).data || [];
  const users = (await sb.from("profiles").select("id, nome")).data || [];
  if (prods.length === 0) {
    console.log("Sem produtos");
    return;
  }
  const op = users[0]?.id;

  const clientes = [
    "Promo Brindes Ltda",
    "Maria Comercio Ltda",
    "Distribuidora ABC S.A.",
    "Supermercado Central Ltda",
    "Armazém Geral Eireli",
    "Tech Solutions ME",
    "Comércio Boa Vista ME",
    "Indústria Norte S.A.",
    "Loja Estrela Eireli",
  ];
  const fornecedores = [
    "Brilho Gráfica Ltda",
    "Textil Premium S.A.",
    "Plásticos Brasil Eireli",
    "Metalúrgica União ME",
    "Print Visual Comunicação",
  ];
  const motivos = [
    "defeito",
    "cor_errada",
    "tamanho_errado",
    "quantidade_errada",
    "produto_errado",
    "avaria_transporte",
    "desistencia",
    "outro",
  ];
  const statusCycle = [
    "aberto",
    "aberto",
    "em_analise",
    "em_analise",
    "aprovado",
    "aprovado",
    "em_transito",
    "recebido",
    "finalizado",
    "recusado",
  ];
  const descricoes = [
    "Produto recebido com amassado na lateral direita. Embalagem danificada durante transporte.",
    "Cor do produto diverge da amostra aprovada. Cliente solicita troca imediata.",
    "Tamanho M recebido, mas pedido foi tamanho G. Erro na separação.",
    "Quantidade entregue diverge do pedido - faltam 50 unidades.",
    "Produto totalmente diferente do SKU solicitado. Erro de picking.",
    "Avaria detectada na entrega - caixas molhadas, produtos comprometidos.",
    "Cliente desistiu da compra. Solicita devolução integral com reembolso.",
    "Defeito de fabricação - impressão borrada em parte do lote.",
    "Solicitação de troca por outro modelo similar do mesmo valor.",
    "Mercadoria danificada por queda durante descarga no destino.",
    "Embalagem violada, indícios de manipulação inadequada.",
    "Produto entregue fora do prazo de validade. Substituição urgente.",
  ];

  const records = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const prod = prods[i % prods.length];
    const tipo = i % 3 === 0 ? "devolucao" : "troca";
    const status = statusCycle[i % statusCycle.length];
    const motivo = motivos[i % motivos.length];
    const qty = 5 + (i % 8) * 3;
    const valorUnit = 15 + (i % 12) * 3;
    const valorTotal = valorUnit * qty;
    const creditoGerado = ["aprovado", "em_transito", "recebido", "finalizado"].includes(status)
      ? i % 2 === 0
      : false;
    const valorCredito = creditoGerado ? valorTotal : null;
    const abertura = new Date(now - i * 3600 * 1000 * 4).toISOString();
    const analise = [
      "em_analise",
      "aprovado",
      "em_transito",
      "recebido",
      "finalizado",
      "recusado",
    ].includes(status)
      ? new Date(now - i * 3600 * 1000 * 3).toISOString()
      : null;
    const resolucao = ["finalizado", "recebido"].includes(status)
      ? new Date(now - i * 3600 * 1000).toISOString()
      : null;
    const resolucaoTexto =
      status === "recusado"
        ? "Solicitação fora do prazo de garantia."
        : status === "finalizado"
          ? "Crédito gerado e processado. Cliente notificado."
          : status === "aprovado"
            ? "Aprovado para troca. Aguardando envio."
            : status === "em_transito"
              ? "Mercadoria em rota de devolução."
              : null;
    records.push({
      tipo,
      pedido: `PED-TD-${String(450000 + i).padStart(6, "0")}`,
      cliente: clientes[i % clientes.length],
      fornecedor: fornecedores[i % fornecedores.length],
      produto: prod.nome,
      sku: prod.sku,
      quantidade: qty,
      valor_unitario: valorUnit,
      valor_total: valorTotal,
      motivo,
      descricao_problema: descricoes[i % descricoes.length],
      status,
      data_abertura: abertura,
      data_analise: analise,
      data_resolucao: resolucao,
      aberto_por: op,
      analisado_por: analise ? op : null,
      resolucao: resolucaoTexto,
      credito_gerado: creditoGerado,
      valor_credito: valorCredito,
    });
  }
  await insert("trocas_devolucoes", records);

  console.log("=== Concluído ===");
})();

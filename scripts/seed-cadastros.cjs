require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function insert(table, records) {
  if (!records.length) return;
  const { error } = await sb.from(table).insert(records);
  if (error && error.code !== "23505") console.log(`${table}: ${error.message}`);
  else console.log(`${table}: ${records.length} OK`);
}

(async () => {
  await insert("categorias", [
    {
      nome: "Canecas",
      descricao: "Canecas personalizadas em cerâmica, porcelana e acrílico",
      cor: "#FF6B6B",
      icone: "Coffee",
    },
    {
      nome: "Camisetas",
      descricao: "Camisetas em algodão, poliamida e mistos",
      cor: "#4ECDC4",
      icone: "Shirt",
    },
    {
      nome: "Canetas",
      descricao: "Canetas metálicas, plásticas e ecológicas",
      cor: "#45B7D1",
      icone: "Pen",
    },
    {
      nome: "Cadernos",
      descricao: "Cadernos brochura, espiral e capa dura",
      cor: "#FFA07A",
      icone: "Book",
    },
    {
      nome: "Chaveiros",
      descricao: "Chaveiros em metal, couro e acrílico",
      cor: "#98D8C8",
      icone: "KeyRound",
    },
    {
      nome: "Bolsas e Mochilas",
      descricao: "Bolsas, mochilas e necessaires",
      cor: "#F7DC6F",
      icone: "Briefcase",
    },
    {
      nome: "Copos e Garrafas",
      descricao: "Copos térmicos, squeeze e garrafas",
      cor: "#BB8FCE",
      icone: "CupSoda",
    },
    {
      nome: "Eletrônicos",
      descricao: "Power banks, pen drives e cabos",
      cor: "#85C1E9",
      icone: "Smartphone",
    },
  ]);

  const resp = (await sb.from("profiles").select("id").limit(1)).data?.[0]?.id;
  await insert("armazens", [
    {
      codigo: "ARM-01",
      nome: "Centro de Distribuição São Paulo",
      endereco: "Av. Paulista, 1000",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100",
      capacidade_total: 50000,
      responsavel_id: resp,
    },
    {
      codigo: "ARM-02",
      nome: "Filial Rio de Janeiro",
      endereco: "Rua do Ouvidor, 50",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "20040-030",
      capacidade_total: 20000,
      responsavel_id: resp,
    },
    {
      codigo: "ARM-03",
      nome: "Filial Curitiba",
      endereco: "Rua XV de Novembro, 200",
      cidade: "Curitiba",
      estado: "PR",
      cep: "80020-310",
      capacidade_total: 15000,
      responsavel_id: resp,
    },
    {
      codigo: "ARM-04",
      nome: "Cross-Dock Campinas",
      endereco: "Rod. Anhanguera, km 92",
      cidade: "Campinas",
      estado: "SP",
      cep: "13069-001",
      capacidade_total: 8000,
      responsavel_id: resp,
    },
  ]);

  await insert("clientes", [
    {
      nome: "Promo Brindes Ltda",
      cpf_cnpj: "12.345.678/0001-90",
      email: "contato@promobrindes.com.br",
      telefone: "(11) 3456-7890",
      endereco: "Av. Brigadeiro Faria Lima, 3477",
      cidade: "São Paulo",
      estado: "SP",
      cep: "04538-133",
    },
    {
      nome: "Maria Comercio Ltda",
      cpf_cnpj: "23.456.789/0001-01",
      email: "comercial@mariacomercio.com.br",
      telefone: "(11) 2345-6789",
      endereco: "Rua Augusta, 1500",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01304-001",
    },
    {
      nome: "Distribuidora ABC S.A.",
      cpf_cnpj: "34.567.890/0001-12",
      email: "comercial@distribuidoraabc.com.br",
      telefone: "(21) 3456-7890",
      endereco: "Av. Rio Branco, 100",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "20040-001",
    },
    {
      nome: "Supermercado Central Ltda",
      cpf_cnpj: "45.678.901/0001-23",
      email: "compras@supermercadocentral.com.br",
      telefone: "(31) 4567-8901",
      endereco: "Av. Afonso Pena, 2000",
      cidade: "Belo Horizonte",
      estado: "MG",
      cep: "30130-005",
    },
    {
      nome: "Armazém Geral Eireli",
      cpf_cnpj: "56.789.012/0001-34",
      email: "contato@armazemgeral.com.br",
      telefone: "(41) 5678-9012",
      endereco: "Rua Sete de Setembro, 3000",
      cidade: "Curitiba",
      estado: "PR",
      cep: "80230-010",
    },
    {
      nome: "Tech Solutions ME",
      cpf_cnpj: "67.890.123/0001-45",
      email: "compras@techsolutions.com.br",
      telefone: "(11) 6789-0123",
      endereco: "Av. Faria Lima, 4000",
      cidade: "São Paulo",
      estado: "SP",
      cep: "04538-132",
    },
  ]);

  const prods = (await sb.from("produtos").select("id").limit(10)).data || [];
  if (prods.length > 0) {
    const statuses = [
      "disponivel",
      "disponivel",
      "disponivel",
      "reservado",
      "expedido",
      "devolvido",
    ];
    const records = [];
    for (let i = 0; i < 25; i++) {
      records.push({
        numero_serial: `SN-${String(100000 + i).padStart(7, "0")}`,
        produto_id: prods[i % prods.length].id,
        status: statuses[i % statuses.length],
      });
    }
    await insert("serial_numbers", records);
  }

  console.log("=== Concluído ===");
})();

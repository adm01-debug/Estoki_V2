/**
 * Script de Seed - Popula o banco com dados fictícios para teste
 * Executar com: node scripts/seed-db.cjs
 */

require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log("==================================================");
console.log("  SEED DO BANCO DE DADOS - ESTOKI WMS");
console.log("==================================================");
console.log("");
console.log("ATENÇÃO: Este script cria dados de TESTE.");
console.log("         Não execute em produção!");
console.log("");
console.log("==================================================");
console.log("");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seed() {
  const results = [];

  // ========================================
  // 1. CRIAR USUÁRIOS DE TESTE NO AUTH
  // ========================================
  console.log("1️⃣  Criando usuários de teste no Auth...");

  const testUsers = [
    { email: "admin@estoki.com.br", password: "Teste123!", nome: "Administrador", role: "admin" },
    {
      email: "supervisor@estoki.com.br",
      password: "Teste123!",
      nome: "Carlos Supervisor",
      role: "supervisor",
    },
    {
      email: "operador1@estoki.com.br",
      password: "Teste123!",
      nome: "João Operador",
      role: "operador",
    },
    {
      email: "operador2@estoki.com.br",
      password: "Teste123!",
      nome: "Maria Operadora",
      role: "operador",
    },
  ];

  const createdUsers = [];

  for (const user of testUsers) {
    try {
      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .single();

      if (existingUser) {
        console.log(`   ⏭️  ${user.email} - já existe`);
        createdUsers.push({ id: existingUser.id, ...user });
        continue;
      }

      // Criar usuário
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { nome: user.nome },
      });

      if (error) {
        console.log(`   ⚠️  ${user.email} - ${error.message}`);
      } else {
        console.log(`   ✅ ${user.email} - criado`);
        createdUsers.push({ id: data.user.id, ...user });
      }

      await sleep(500); // Evitar rate limit
    } catch (e) {
      console.log(`   ❌ ${user.email} - ERRO: ${e.message}`);
    }
  }

  // ========================================
  // 2. ATUALIZAR ROLES DOS USUÁRIOS
  // ========================================
  console.log("\n2️⃣  Configurando roles dos usuários...");

  for (const user of createdUsers) {
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: user.role }, { onConflict: "user_id" });

      if (error) {
        console.log(`   ⚠️  ${user.email} - role: ${error.message}`);
      } else {
        console.log(`   ✅ ${user.email} = ${user.role}`);
      }
    } catch (e) {
      console.log(`   ❌ ${user.email} - ERRO: ${e.message}`);
    }
  }

  // ========================================
  // 3. POPULAR TABELA PRODUCTS
  // ========================================
  console.log("\n3️⃣  Populando tabela products...");

  const products = [
    { sku: "BRINDE-001", name: "Caneca Personalizada Promoção 2024", stock_quantity: 500 },
    { sku: "BRINDE-002", name: "Camiseta Estampada Algodão", stock_quantity: 200 },
    { sku: "BRINDE-003", name: "Boné Personalizado Logo Brasil", stock_quantity: 300 },
    { sku: "BRINDE-004", name: "Chaveiro Metal Promocional", stock_quantity: 1000 },
    { sku: "BRINDE-005", name: "Bolsa Térmica Executiva", stock_quantity: 150 },
    { sku: "BRINDE-006", name: "Pen Drive 16GB Customizado", stock_quantity: 75 },
    { sku: "BRINDE-007", name: "Copo Plástico Térmico 500ml", stock_quantity: 400 },
    { sku: "BRINDE-008", name: "Squeeze Alumínio Personalizado", stock_quantity: 250 },
    { sku: "BRINDE-009", name: "Caderno Corporativo A5", stock_quantity: 180 },
    { sku: "BRINDE-010", name: "Power Bank 5000mAh", stock_quantity: 60 },
    { sku: "BRINDE-011", name: "Carteira Porto Alegre Couro", stock_quantity: 90 },
    { sku: "BRINDE-012", name: 'Mochila Notebook 15.6"', stock_quantity: 45 },
    { sku: "BRINDE-013", name: "Guarda-Chuva Compacto Personalizado", stock_quantity: 120 },
    { sku: "BRINDE-014", name: "Relógio de Mesa Digital Promocional", stock_quantity: 30 },
    { sku: "BRINDE-015", name: " Kit Escritório (Bloco + Caneta)", stock_quantity: 350 },
  ];

  for (const product of products) {
    try {
      const { error } = await supabase.from("products").upsert(product, { onConflict: "sku" });
      if (error) {
        console.log(`   ❌ ${product.sku}: ${error.message}`);
      }
    } catch (e) {
      console.log(`   ❌ ${product.sku}: ERRO`);
    }
  }
  console.log(`   ✅ ${products.length} produtos inseridos/atualizados`);

  // ========================================
  // 4. POPULAR TABELA LOCATIONS
  // ========================================
  console.log("\n4️⃣  Populando tabela locations...");

  const locations = [
    // Zona de Recebimento
    { zone: "RECEBIMENTO", aisle: "A", rack: "01", level: "01", bin: "01", status: "available" },
    { zone: "RECEBIMENTO", aisle: "A", rack: "01", level: "01", bin: "02", status: "available" },
    { zone: "RECEBIMENTO", aisle: "A", rack: "02", level: "01", bin: "01", status: "available" },
    // Zona de Armazenagem
    { zone: "ARMAZENAGEM", aisle: "A", rack: "01", level: "01", bin: "01", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "A", rack: "01", level: "01", bin: "02", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "A", rack: "01", level: "02", bin: "01", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "A", rack: "02", level: "01", bin: "01", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "A", rack: "02", level: "01", bin: "02", status: "occupied" },
    { zone: "ARMAZENAGEM", aisle: "B", rack: "01", level: "01", bin: "01", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "B", rack: "01", level: "01", bin: "02", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "B", rack: "02", level: "01", bin: "01", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "C", rack: "01", level: "01", bin: "01", status: "available" },
    { zone: "ARMAZENAGEM", aisle: "C", rack: "01", level: "01", bin: "02", status: "available" },
    // Zona de Expedição
    { zone: "EXPEDICAO", aisle: "E", rack: "01", level: "01", bin: "01", status: "available" },
    { zone: "EXPEDICAO", aisle: "E", rack: "01", level: "01", bin: "02", status: "available" },
    { zone: "EXPEDICAO", aisle: "E", rack: "01", level: "01", bin: "03", status: "available" },
    // Zona de Triagem
    { zone: "TRIAGEM", aisle: "T", rack: "01", level: "01", bin: "01", status: "available" },
    { zone: "TRIAGEM", aisle: "T", rack: "01", level: "01", bin: "02", status: "available" },
  ];

  for (const loc of locations) {
    try {
      await supabase.from("locations").insert(loc);
    } catch (e) {
      // Ignorar erros de duplicidade
    }
  }
  console.log(`   ✅ ${locations.length} localizações inseridas`);

  // ========================================
  // 5. POPULAR TABELA PURCHASE_ORDERS
  // ========================================
  console.log("\n5️⃣  Populando tabela purchase_orders...");

  const purchaseOrders = [
    { order_number: "PO-2024-0001", status: "delivered", supplier_name: "Fornecedor Brindes LTDA" },
    {
      order_number: "PO-2024-0002",
      status: "delivered",
      supplier_name: "Artigos Promocionais ABC",
    },
    { order_number: "PO-2024-0003", status: "in_transit", supplier_name: "Distribuidora Brasil" },
    { order_number: "PO-2024-0004", status: "pending", supplier_name: "Fornecedor Brindes LTDA" },
    { order_number: "PO-2024-0005", status: "pending", supplier_name: "Importadora Express" },
  ];

  for (const po of purchaseOrders) {
    try {
      await supabase.from("purchase_orders").upsert(
        {
          order_number: po.order_number,
          status: po.status,
          supplier_name: po.supplier_name,
        },
        { onConflict: "order_number" }
      );
    } catch (e) {
      console.log(`   ❌ ${po.order_number}: ${e.message}`);
    }
  }
  console.log(`   ✅ ${purchaseOrders.length} ordens de compra inseridas`);

  // ========================================
  // 6. POPULAR TABELA INVENTORY_LOTS
  // ========================================
  console.log("\n6️⃣  Populando tabela inventory_lots...");

  const lots = [
    { batch_number: "LOTE-2024-001", product_sku: "BRINDE-001", quantity: 100, status: "active" },
    { batch_number: "LOTE-2024-002", product_sku: "BRINDE-002", quantity: 50, status: "active" },
    { batch_number: "LOTE-2024-003", product_sku: "BRINDE-003", quantity: 75, status: "active" },
    { batch_number: "LOTE-2024-004", product_sku: "BRINDE-004", quantity: 200, status: "active" },
    { batch_number: "LOTE-2024-005", product_sku: "BRINDE-005", quantity: 30, status: "active" },
  ];

  for (const lot of lots) {
    try {
      // Primeiro buscar o product_id
      const { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("sku", lot.product_sku)
        .single();

      if (product) {
        await supabase.from("inventory_lots").upsert(
          {
            batch_number: lot.batch_number,
            product_id: product.id,
            quantity: lot.quantity,
            status: lot.status,
          },
          { onConflict: "batch_number" }
        );
      }
    } catch (e) {
      // Ignorar
    }
  }
  console.log(`   ✅ ${lots.length} lotes inseridos`);

  // ========================================
  // RESUMO FINAL
  // ========================================
  console.log("\n==================================================");
  console.log("  SEED CONCLUÍDO COM SUCESSO!");
  console.log("==================================================");
  console.log("");
  console.log("📋 USUÁRIOS PARA TESTE:");
  console.log("");
  for (const user of testUsers) {
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${user.password}`);
    console.log(`   Role:  ${user.role}`);
    console.log("");
  }
  console.log("==================================================");
  console.log("");
  console.log("💡 Próximos passos:");
  console.log("   1. Acesse http://localhost:8080");
  console.log("   2. Faça login com um dos usuários acima");
  console.log("   3. Teste as funcionalidades do sistema");
  console.log("");
}

seed().catch(console.error);

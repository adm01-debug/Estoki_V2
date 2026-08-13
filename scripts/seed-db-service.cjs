/**
 * Script de Seed - Versão com Service Role
 * Executar com: SERVICE_ROLE_KEY=sua_chave node scripts/seed-db-service.cjs
 *
 * Para obter a service_role key:
 * 1. Acesse https://supabase.com/dashboard
 * 2. Vá em Settings > API
 * 3. Copie a "service_role" secret key
 */

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ ERRO: SERVICE_ROLE_KEY não definida!');
  console.log('');
  console.log('Para executar este script:');
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Vá em Settings > API do projeto "estoki-v2"');
  console.log('3. Copie a "service_role (supersecret)" key');
  console.log('4. Execute: SERVICE_ROLE_KEY="sua_key" node scripts/seed-db-service.cjs');
  console.log('');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('==================================================');
console.log('  SEED DO BANCO - MODO ADMIN (Service Role)');
console.log('==================================================');
console.log('');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seed() {
  // ========================================
  // 1. CRIAR USUÁRIOS DE TESTE
  // ========================================
  console.log('1️⃣  Criando usuários de teste...');

  const testUsers = [
    { email: 'admin@estoki.com.br', password: 'Teste123!', nome: 'Administrador do Sistema', role: 'admin' },
    { email: 'supervisor@estoki.com.br', password: 'Teste123!', nome: 'Carlos Silva', role: 'supervisor' },
    { email: 'operador1@estoki.com.br', password: 'Teste123!', nome: 'João Santos', role: 'operador' },
    { email: 'operador2@estoki.com.br', password: 'Teste123!', nome: 'Maria Oliveira', role: 'operador' },
  ];

  const createdUsers = [];

  for (const user of testUsers) {
    try {
      // Verificar se já existe
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existing) {
        console.log(`   ⏭️  ${user.email} - já existe`);
        createdUsers.push({ id: existing.id, ...user });
        continue;
      }

      // Criar usuário
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { nome: user.nome }
      });

      if (error) {
        console.log(`   ❌ ${user.email} - ${error.message}`);
      } else {
        console.log(`   ✅ ${user.email} - criado (ID: ${data.user.id.substring(0, 8)}...)`);
        createdUsers.push({ id: data.user.id, ...user });
      }

      await sleep(300);
    } catch (e) {
      console.log(`   ❌ ${user.email} - ERRO: ${e.message}`);
    }
  }

  // ========================================
  // 2. CONFIGURAR ROLES
  // ========================================
  console.log('\n2️⃣  Configurando roles...');

  for (const user of createdUsers) {
    try {
      await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: user.id, role: user.role }, { onConflict: 'user_id' });
      console.log(`   ✅ ${user.email} → ${user.role}`);
    } catch (e) {
      console.log(`   ⚠️  ${user.email} - ${e.message}`);
    }
  }

  // ========================================
  // 3. POPULAR PRODUCTS
  // ========================================
  console.log('\n3️⃣  Populando products...');

  const products = [
    { sku: 'BRINDE-001', name: 'Caneca Personalizada 350ml', stock_quantity: 500, quality_status: 'approved' },
    { sku: 'BRINDE-002', name: 'Camiseta Algodão Estampada M', stock_quantity: 200, quality_status: 'approved' },
    { sku: 'BRINDE-003', name: 'Camiseta Algodão Estampada G', stock_quantity: 150, quality_status: 'approved' },
    { sku: 'BRINDE-004', name: 'Boné 6 Bossas Personalizado', stock_quantity: 300, quality_status: 'approved' },
    { sku: 'BRINDE-005', name: 'Chaveiro Metal Promocional', stock_quantity: 1000, quality_status: 'approved' },
    { sku: 'BRINDE-006', name: 'Bolsa Térmica 12L Executiva', stock_quantity: 150, quality_status: 'approved' },
    { sku: 'BRINDE-007', name: 'Pen Drive 16GB Customizado', stock_quantity: 75, quality_status: 'approved' },
    { sku: 'BRINDE-008', name: 'Copo Térmico Inox 500ml', stock_quantity: 400, quality_status: 'approved' },
    { sku: 'BRINDE-009', name: 'Squeeze Alumínio 750ml', stock_quantity: 250, quality_status: 'approved' },
    { sku: 'BRINDE-010', name: 'Caderno A5 Corporativo', stock_quantity: 180, quality_status: 'approved' },
    { sku: 'BRINDE-011', name: 'Power Bank 10000mAh', stock_quantity: 60, quality_status: 'approved' },
    { sku: 'BRINDE-012', name: 'Carteira Couro Sintético', stock_quantity: 90, quality_status: 'approved' },
    { sku: 'BRINDE-013', name: 'Mochila Notebook 15.6"', stock_quantity: 45, quality_status: 'approved' },
    { sku: 'BRINDE-014', name: 'Guarda-Chuva Compacto', stock_quantity: 120, quality_status: 'approved' },
    { sku: 'BRINDE-015', name: 'Kit Escritório (Bloco+Caneta)', stock_quantity: 350, quality_status: 'approved' },
    { sku: 'BRINDE-016', name: 'Óculos Sol Personalizado', stock_quantity: 85, quality_status: 'pending' },
    { sku: 'BRINDE-017', name: 'Borracha Escolar Promocional', stock_quantity: 600, quality_status: 'approved' },
    { sku: 'BRINDE-018', name: 'Régua 30cm Personalizada', stock_quantity: 400, quality_status: 'approved' },
    { sku: 'BRINDE-019', name: 'Lápis Personalizado Cx/50', stock_quantity: 50, quality_status: 'approved' },
    { sku: 'BRINDE-020', name: 'Marcador Página Imantado', stock_quantity: 300, quality_status: 'approved' },
  ];

  for (const product of products) {
    try {
      await supabaseAdmin.from('products').upsert(product, { onConflict: 'sku' });
    } catch (e) {
      console.log(`   ❌ ${product.sku}: ${e.message}`);
    }
  }
  console.log(`   ✅ ${products.length} produtos`);

  // ========================================
  // 4. POPULAR LOCATIONS
  // ========================================
  console.log('\n4️⃣  Populando locations...');

  const locations = [];
  const zones = ['RECEBIMENTO', 'ARMAZENAGEM', 'EXPEDICAO', 'TRIAGEM'];
  const aisles = ['A', 'B', 'C', 'D'];

  for (const zone of zones) {
    for (const aisle of aisles) {
      for (let rack = 1; rack <= 4; rack++) {
        for (let level = 1; level <= 3; level++) {
          for (let bin = 1; bin <= 2; bin++) {
            locations.push({
              zone,
              aisle,
              rack: String(rack).padStart(2, '0'),
              level: String(level).padStart(2, '0'),
              bin: String(bin).padStart(2, '0'),
              status: 'available'
            });
          }
        }
      }
    }
  }

  for (const loc of locations) {
    try {
      await supabaseAdmin.from('locations').insert(loc);
    } catch (e) {
      // Ignorar duplicatas
    }
  }
  console.log(`   ✅ ${locations.length} localizações`);

  // ========================================
  // 5. POPULAR PURCHASE_ORDERS
  // ========================================
  console.log('\n5️⃣  Populando purchase_orders...');

  const orders = [
    { order_number: 'PO-2024-0001', status: 'delivered', supplier_name: 'Fornecedor Brindes LTDA' },
    { order_number: 'PO-2024-0002', status: 'delivered', supplier_name: 'Artigos Promocionais ABC' },
    { order_number: 'PO-2024-0003', status: 'in_transit', supplier_name: 'Distribuidora Brasil' },
    { order_number: 'PO-2024-0004', status: 'pending', supplier_name: 'Fornecedor Brindes LTDA' },
    { order_number: 'PO-2024-0005', status: 'pending', supplier_name: 'Importadora Express' },
    { order_number: 'PO-2024-0006', status: 'processing', supplier_name: 'Creative Gifts' },
    { order_number: 'PO-2024-0007', status: 'processing', supplier_name: 'Brindes Premium' },
  ];

  for (const order of orders) {
    try {
      await supabaseAdmin.from('purchase_orders').upsert(order, { onConflict: 'order_number' });
    } catch (e) {
      // Ignorar
    }
  }
  console.log(`   ✅ ${orders.length} ordens de compra`);

  // ========================================
  // 6. POPULAR INVENTORY_LOTS
  // ========================================
  console.log('\n6️⃣  Populando inventory_lots...');

  // Buscar products para pegar IDs
  const { data: allProducts } = await supabaseAdmin.from('products').select('id, sku');
  const productMap = {};
  allProducts?.forEach(p => productMap[p.sku] = p.id);

  const lots = [
    { batch_number: 'LOTE-2024-001', sku: 'BRINDE-001', quantity: 100, status: 'active' },
    { batch_number: 'LOTE-2024-002', sku: 'BRINDE-002', quantity: 50, status: 'active' },
    { batch_number: 'LOTE-2024-003', sku: 'BRINDE-003', quantity: 75, status: 'active' },
    { batch_number: 'LOTE-2024-004', sku: 'BRINDE-004', quantity: 200, status: 'active' },
    { batch_number: 'LOTE-2024-005', sku: 'BRINDE-005', quantity: 30, status: 'active' },
  ];

  for (const lot of lots) {
    if (productMap[lot.sku]) {
      try {
        await supabaseAdmin.from('inventory_lots').upsert({
          batch_number: lot.batch_number,
          product_id: productMap[lot.sku],
          quantity: lot.quantity,
          status: lot.status
        }, { onConflict: 'batch_number' });
      } catch (e) {
        console.log(`   ❌ ${lot.batch_number}: ${e.message}`);
      }
    }
  }
  console.log(`   ✅ ${lots.length} lotes`);

  // ========================================
  // RESUMO
  // ========================================
  console.log('\n==================================================');
  console.log('  ✅ SEED CONCLUÍDO!');
  console.log('==================================================');
  console.log('');
  console.log('📋 USUÁRIOS CRIADOS:');
  console.log('');
  for (const user of testUsers) {
    console.log(`   👤 ${user.email}`);
    console.log(`      Senha: ${user.password}`);
    console.log(`      Role: ${user.role}`);
    console.log('');
  }
  console.log('==================================================');
  console.log('');
  console.log('🚀 Acesse http://localhost:8080 e faça login!');
  console.log('');
}

seed().catch(console.error);

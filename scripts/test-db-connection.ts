/**
 * Script de teste de conexão com banco de dados
 * Executar com: npx tsx scripts/test-db-connection.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config({ path: resolve(__dirname, "../.env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log("=".repeat(50));
console.log("TESTE DE CONEXÃO COM BANCO DE DADOS");
console.log("=".repeat(50));
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Key: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`);
console.log("=".repeat(50));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ ERRO: Variáveis de ambiente não encontradas!");
  console.error("   Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log("\n🔄 Testando conexão com banco...");

  // Teste 1: Listar profiles
  console.log("\n1️⃣  Testando tabela 'profiles'...");
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, nome")
    .limit(5);

  if (profilesError) {
    console.error(`   ❌ Erro: ${profilesError.message}`);
  } else {
    console.log(`   ✅ Tabela 'profiles' OK - ${profiles?.length || 0} registros`);
    if (profiles && profiles.length > 0) {
      profiles.forEach((p: any) => {
        console.log(`      - ${p.email} (${p.nome || "sem nome"})`);
      });
    }
  }

  // Teste 2: Listar user_roles
  console.log("\n2️⃣  Testando tabela 'user_roles'...");
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .limit(5);

  if (rolesError) {
    console.error(`   ❌ Erro: ${rolesError.message}`);
  } else {
    console.log(`   ✅ Tabela 'user_roles' OK - ${roles?.length || 0} registros`);
  }

  // Teste 3: Listar feature_flags
  console.log("\n3️⃣  Testando tabela 'feature_flags'...");
  const { data: flags, error: flagsError } = await supabase
    .from("feature_flags")
    .select("key, enabled")
    .limit(10);

  if (flagsError) {
    console.error(`   ❌ Erro: ${flagsError.message}`);
  } else {
    console.log(`   ✅ Tabela 'feature_flags' OK - ${flags?.length || 0} registros`);
  }

  // Teste 4: Verificar auth
  console.log("\n4️⃣  Testando autenticação...");
  const { data: authData, error: authError } = await supabase.auth.getSession();

  if (authError) {
    console.error(`   ❌ Erro: ${authError.message}`);
  } else {
    console.log(`   ✅ Auth OK - ${authData.session ? "Sessão ativa" : "Sem sessão"}`);
  }

  // Resumo
  console.log("\n" + "=".repeat(50));
  console.log("RESUMO");
  console.log("=".repeat(50));

  const hasErrors = [profilesError, rolesError, flagsError].some(e => e);
  if (hasErrors) {
    console.log("⚠️  Algumas tabelas não foram encontradas.");
    console.log("   Isso pode significar que as migrações não foram executadas.");
    console.log("\n💡 Soluções possíveis:");
    console.log("   1. Execute as migrações: npx supabase db push");
    console.log("   2. Ou execute o seed: npx supabase db seed");
    console.log("   3. Verifique se o banco está acessível");
  } else {
    console.log("✅ Conexão com banco de dados OK!");
  }
}

testConnection().catch(console.error);

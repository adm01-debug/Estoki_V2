#!/usr/bin/env npx ts-node
/**
 * Script para gerar tipos TypeScript do Supabase
 * Execute: npx ts-node scripts/generate-types.ts
 */

import { execSync } from "child_process";

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

if (!SUPABASE_PROJECT_ID) {
  console.error("SUPABASE_PROJECT_ID não definido");
  process.exit(1);
}

console.log("Gerando tipos do Supabase...");

try {
  execSync(
    `npx supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID} > src/integrations/supabase/types.ts`,
    { stdio: "inherit" }
  );
  console.log("✅ Tipos gerados com sucesso!");
} catch (error) {
  console.error("❌ Erro ao gerar tipos:", error);
  process.exit(1);
}

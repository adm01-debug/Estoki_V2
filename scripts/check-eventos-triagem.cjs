require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  // Verificar schema
  const { data: sample } = await sb.from("eventos_triagem").select("*").limit(1);
  console.log("Schema eventos_triagem:", JSON.stringify(sample?.[0], null, 2));
  if (!sample || sample.length === 0) {
    const { data: cols } = await sb.from("eventos_triagem").select("*").limit(0);
    console.log("Tentando descobrir colunas via insert vazio...");
  }
})();

require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  const tentativas = [
    {},
    { lote_id: "00000000-0000-0000-0000-000000000000" },
    { status: "em_andamento" },
  ];

  for (const t of tentativas) {
    const { error } = await sb.from("eventos_triagem").insert(t);
    console.log(JSON.stringify(t), "->", error?.message || "ok");
  }
})();

require("dotenv").config({ path: ".env" });
const { spawnSync } = require("child_process");
const fs = require("fs");
const sql = fs.readFileSync("scripts/create_cadastros_rls.sql", "utf8");

// O Supabase CLI nao aceita multi-statement via --query, mas DO block funciona.
// O problema e' o tamanho/quoting via shell. Vamos usar --file que envia como arquivo.
const tmpfile = "/tmp/rls_apply.sql";
fs.writeFileSync(tmpfile, sql);

const result = spawnSync(
  "npx",
  [
    "supabase",
    "db",
    "query",
    "--db-url",
    "postgresql://postgres:DJ9PcaG72-z-ES%40@db.ookjbflsnoefnsixrspc.supabase.co:5432/postgres",
    "--file",
    tmpfile,
  ],
  { encoding: "utf8", stdio: "pipe" }
);
console.log("stdout:", result.stdout);
console.log("stderr:", result.stderr);
console.log("status:", result.status);

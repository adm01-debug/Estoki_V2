require("dotenv").config({ path: ".env" });
const { spawnSync } = require("child_process");
const fs = require("fs");
const sql = fs.readFileSync("scripts/create_cadastros_rls.sql", "utf8");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("ERROR: DATABASE_URL env var is required (set it in .env).");
  process.exit(1);
}

const tmpfile = "/tmp/rls_apply.sql";
fs.writeFileSync(tmpfile, sql);

const result = spawnSync(
  "npx",
  [
    "supabase",
    "db",
    "query",
    "--db-url",
    dbUrl,
    "--file",
    tmpfile,
  ],
  { encoding: "utf8", stdio: "pipe" }
);
console.log("stdout:", result.stdout);
console.log("stderr:", result.stderr);
console.log("status:", result.status);

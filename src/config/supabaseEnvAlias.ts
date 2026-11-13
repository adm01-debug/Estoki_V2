// A integração Supabase↔Vercel cria NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (e SUPABASE_URL...),
// mas o app lê VITE_SUPABASE_*. Sem isto o build de produção saía sem Supabase e o client.ts lançava
// "Missing Supabase environment variables" ao abrir. Só copia os valores PÚBLICOS (URL e chave anon/publishable)
// e nunca sobrescreve uma VITE_* já definida. A service_role nunca entra no bundle.
export function aliasSupabaseEnv(env: Record<string, string | undefined>): Record<string, string> {
  const primeiro = (...nomes: string[]) =>
    nomes.map((n) => env[n]).find((v) => v && v.trim() !== "");
  const url = primeiro("VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const chave = primeiro(
    "VITE_SUPABASE_ANON_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY"
  );
  const out: Record<string, string> = {};
  if (url && !env.VITE_SUPABASE_URL) out.VITE_SUPABASE_URL = url;
  if (chave && !env.VITE_SUPABASE_ANON_KEY) out.VITE_SUPABASE_ANON_KEY = chave;
  if (chave && !env.VITE_SUPABASE_PUBLISHABLE_KEY) out.VITE_SUPABASE_PUBLISHABLE_KEY = chave;
  return out;
}

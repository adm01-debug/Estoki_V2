import { describe, it, expect } from "vitest";
import { aliasSupabaseEnv } from "../supabaseEnvAlias";

// Na Vercel a integração Supabase cria NEXT_PUBLIC_SUPABASE_* / SUPABASE_*, mas o app lê VITE_SUPABASE_*.
describe("aliasSupabaseEnv", () => {
  it("usa os nomes da integração quando faltam as VITE_*", () => {
    expect(
      aliasSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      })
    ).toEqual({
      VITE_SUPABASE_URL: "https://x.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon",
      VITE_SUPABASE_PUBLISHABLE_KEY: "anon",
    });
  });

  it("nunca sobrescreve VITE_* já definidas", () => {
    expect(
      aliasSupabaseEnv({
        VITE_SUPABASE_URL: "https://local.supabase.co",
        VITE_SUPABASE_ANON_KEY: "local",
        VITE_SUPABASE_PUBLISHABLE_KEY: "local",
        NEXT_PUBLIC_SUPABASE_URL: "https://outro.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "outra",
      })
    ).toEqual({});
  });

  it("prefere a publishable à anon legada e ignora valores vazios", () => {
    expect(
      aliasSupabaseEnv({
        SUPABASE_URL: "https://y.supabase.co",
        NEXT_PUBLIC_SUPABASE_URL: "  ",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_1",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "legada",
      }).VITE_SUPABASE_ANON_KEY
    ).toBe("sb_publishable_1");
  });

  it("nunca usa a service_role nem a secret key", () => {
    const out = aliasSupabaseEnv({
      SUPABASE_SERVICE_ROLE_KEY: "s",
      SUPABASE_SECRET_KEY: "s",
      SUPABASE_URL: "https://z.supabase.co",
    });
    expect(Object.values(out)).not.toContain("s");
    expect(out.VITE_SUPABASE_ANON_KEY).toBeUndefined();
  });

  it("sem nada configurado não inventa valores (o client.ts continua acusando)", () => {
    expect(aliasSupabaseEnv({})).toEqual({});
  });
});

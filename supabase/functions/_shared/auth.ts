/**
 * Guarda de sessao para Edge Functions.
 *
 * `verify_jwt = true` NAO protege: a chave publica do site (`sb_publishable_*`)
 * e aceita como Bearer e chega sem usuario, entao funcao sem checagem propria
 * fica executavel por qualquer visitante (medido em producao em 25/11/2026:
 * `reorder-check` devolvia produto/estoque e `send-email-alert` aceitava a
 * chamada anonima). Estas funcoes sao chamadas pelo app logado, por cron
 * interno (service role) ou por outra edge interna.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "./cors.ts";

/** Token do header `Authorization: Bearer <token>`, ou `null` quando ausente. */
export function tokenDoBearer(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/** `true` quando a chamada traz o proprio service role (cron ou edge interna). */
export function veioDoInterno(req: Request): boolean {
  const token = tokenDoBearer(req);
  const segredo = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return Boolean(token && segredo && token === segredo);
}

/** Id do usuario logado, ou `null` quando o token nao e de uma sessao real. */
export async function usuarioDaSessao(req: Request): Promise<string | null> {
  const token = tokenDoBearer(req);
  if (!token) return null;
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

/**
 * `null` quando pode seguir; `Response` 401 quando nao ha sessao de usuario nem
 * o service role. Uso: `const recusa = await exigirSessao(req); if (recusa) return recusa;`
 */
export async function exigirSessao(req: Request): Promise<Response | null> {
  if (veioDoInterno(req)) return null;
  if (await usuarioDaSessao(req)) return null;
  return new Response(JSON.stringify({ error: "sessao obrigatoria" }), {
    status: 401,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}
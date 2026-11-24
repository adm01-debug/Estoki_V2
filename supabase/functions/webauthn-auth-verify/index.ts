import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { GenericPayloadSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // Exigir JWT — passkey é segundo fator, não substituto de sessão
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Authorization required" }), {
      status: 401,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const __raw = await req.json();
    const __v = validateInput(GenericPayloadSchema, __raw);
    if (!__v.success) return new Response(JSON.stringify(__v), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    const { credential, challengeId, userId } = __raw;

    if (!credential?.id || !challengeId || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Verificar e consumir o challenge
    const { data: challengeData, error: challengeError } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("id", challengeId)
      .eq("user_id", userId)
      .eq("type", "authentication")
      .single();

    if (challengeError || !challengeData) {
      return new Response(JSON.stringify({ error: "Challenge not found or expired" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    await supabase.from("webauthn_challenges").delete().eq("id", challengeId);

    if (new Date(challengeData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Challenge expired" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Verificar que a credencial existe e pertence ao usuário
    const { data: storedCredential, error: credError } = await supabase
      .from("passkey_credentials")
      .select("*")
      .eq("credential_id", credential.id)
      .eq("user_id", userId)
      .single();

    if (credError || !storedCredential) {
      return new Response(JSON.stringify({ error: "Credential not found" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // VERIFICAÇÃO CRIPTOGRÁFICA — exigida pela especificação WebAuthn W3C
    // Sem ela qualquer pessoa com credential_id+challengeId pode obter token.
    // Implementação completa requer @simplewebauthn/server (Deno-compatible).
    // Por ora: bloquear até a verificação estar implementada.
    // TODO: implementar verify com @noble/curves ou importar @simplewebauthn/server
    return new Response(
      JSON.stringify({
        error: "Passkey authentication temporarily disabled pending cryptographic verification implementation.",
      }),
      {
        status: 503,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

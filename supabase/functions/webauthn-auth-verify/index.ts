import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { GenericPayloadSchema, validateInput } from "../_shared/schemas.ts";
import { resolveRp, verifyAuthenticationCredential } from "../_shared/webauthn.ts";

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
    if (!__v.success) {
      return new Response(JSON.stringify(__v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { credential, challengeId, userId } = __raw;

    if (!credential?.id || !credential?.response?.signature || !challengeId || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

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

    // Verificação criptográfica exigida pela especificação WebAuthn: assinatura sobre
    // authenticatorData || SHA256(clientDataJSON) com a chave pública registrada.
    const { rpId, expectedOrigin } = resolveRp(req);

    let verified;
    try {
      verified = await verifyAuthenticationCredential({
        credential,
        expectedChallenge: challengeData.challenge,
        expectedOrigin,
        rpId,
        storedCredentialId: storedCredential.credential_id,
        storedPublicKey: storedCredential.public_key,
        storedCounter: storedCredential.counter ?? 0,
      });
    } catch (verifyError: unknown) {
      const message = verifyError instanceof Error ? verifyError.message : "Verificacao falhou";
      return new Response(JSON.stringify({ error: `Autenticacao rejeitada: ${message}` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("passkey_credentials")
      .update({ counter: verified.newCounter, last_used_at: new Date().toISOString() })
      .eq("id", storedCredential.id);

    if (updateError) {
      console.error("Error updating credential counter:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        userVerified: verified.userVerified,
        newCounter: verified.newCounter,
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
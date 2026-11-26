import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { GenericPayloadSchema, validateInput } from "../_shared/schemas.ts";
import { resolveRp, verifyRegistrationCredential } from "../_shared/webauthn.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const __raw = await req.json();
    const __v = validateInput(GenericPayloadSchema, __raw);
    if (!__v.success) {
      return new Response(JSON.stringify(__v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { credential, deviceName } = __raw;

    if (!credential?.id || !credential?.response?.clientDataJSON || !credential?.response?.attestationObject) {
      return new Response(JSON.stringify({ error: "Invalid credential data" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { data: challengeData, error: challengeError } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "registration")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (challengeError || !challengeData) {
      return new Response(JSON.stringify({ error: "Challenge not found or expired" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    await supabase.from("webauthn_challenges").delete().eq("id", challengeData.id);

    if (new Date(challengeData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Challenge expired" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Verifica attestationObject + clientDataJSON contra o challenge salvo e extrai a chave
    // publica COSE. Sem isso qualquer string servia como public_key (comportamento antigo).
    const { rpId, expectedOrigin } = resolveRp(req);

    let verified;
    try {
      verified = await verifyRegistrationCredential({
        credential,
        expectedChallenge: challengeData.challenge,
        expectedOrigin,
        rpId,
      });
    } catch (verifyError: unknown) {
      const message = verifyError instanceof Error ? verifyError.message : "Verificacao falhou";
      return new Response(JSON.stringify({ error: `Registro rejeitado: ${message}` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await supabase.from("passkey_credentials").insert({
      user_id: user.id,
      credential_id: verified.credentialId,
      public_key: verified.publicKey,
      counter: verified.counter,
      device_name: deviceName || "Unknown Device",
      transports: verified.transports,
    });

    if (insertError) {
      console.error("Error storing credential:", insertError);
      if (insertError.code === "23505") {
        return new Response(JSON.stringify({ error: "This passkey is already registered" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      throw insertError;
    }

    console.log("Passkey registered successfully for user:", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        credentialId: verified.credentialId,
        message: "Passkey registered successfully",
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error verifying registration:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
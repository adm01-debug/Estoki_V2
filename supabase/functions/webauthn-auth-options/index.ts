import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { GenericPayloadSchema, validateInput } from "../_shared/schemas.ts";
import { buildAuthenticationOptions, resolveRp } from "../_shared/webauthn.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // Exigir JWT válido — sem sessão autenticada não há passkey para usar
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
    const { email } = __raw;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { data: authUser, error: authError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "No passkeys registered for this user" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const userId = authUser.id;

    const { data: credentials, error: credError } = await supabase
      .from("passkey_credentials")
      .select("credential_id, public_key, transports")
      .eq("user_id", userId);

    if (credError || !credentials?.length) {
      return new Response(JSON.stringify({ error: "No passkeys registered for this user" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { rpId } = resolveRp(req);

    // generateAuthenticationOptions produz challenge base64url (32 bytes) e allowCredentials no
    // formato PublicKeyCredentialRequestOptionsJSON. Antes o retorno vinha achatado e sem
    // "options", então o cliente sempre caía em "Resposta inválida do servidor".
    const options = await buildAuthenticationOptions({
      rpId,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credential_id,
        transports: cred.transports ?? ["internal"],
      })),
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: challengeData, error: challengeError } = await supabase
      .from("webauthn_challenges")
      .insert({ user_id: userId, challenge: options.challenge, type: "authentication", expires_at: expiresAt })
      .select("id")
      .single();

    if (challengeError || !challengeData) {
      return new Response(JSON.stringify({ error: "Failed to create challenge" }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ options, challengeId: challengeData.id, userId }),
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
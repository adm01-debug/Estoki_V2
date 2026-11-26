import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { usuarioDaSessao } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { GenericPayloadSchema, validateInput } from "../_shared/schemas.ts";
import { buildRegistrationOptions, resolveRp } from "../_shared/webauthn.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const sessaoUserId = await usuarioDaSessao(req);
  if (!sessaoUserId) {
    return new Response(JSON.stringify({ error: "sessao obrigatoria" }), {
      status: 401,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  try {
    const __raw = await req.json().catch(() => ({}));
    const __v = validateInput(GenericPayloadSchema, __raw);
    if (!__v.success) {
      return new Response(JSON.stringify(__v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: sessao, error: authError } = await supabase.auth.admin.getUserById(sessaoUserId);

    if (authError || !sessao?.user) {
      return new Response(JSON.stringify({ error: "sessao obrigatoria" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const user = sessao.user;

    const { deviceName } = __raw;

    const { data: existingCredentials } = await supabase
      .from("passkey_credentials")
      .select("credential_id, transports")
      .eq("user_id", user.id);

    const { rpId } = resolveRp(req);

    const options = await buildRegistrationOptions({
      userId: user.id,
      userEmail: user.email ?? null,
      rpId,
      excludeCredentials: (existingCredentials ?? []).map((cred) => ({
        id: cred.credential_id,
        transports: cred.transports ?? ["internal"],
      })),
    });

    await supabase.from("webauthn_challenges").insert({
      user_id: user.id,
      challenge: options.challenge,
      type: "registration",
    });

    console.log("Generated registration options for user:", user.id);

    return new Response(JSON.stringify({ options, deviceName }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating registration options:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
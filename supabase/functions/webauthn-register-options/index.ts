import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

// Generate cryptographically secure random bytes
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const { deviceName } = await req.json().catch(() => ({}));

    // Get existing credentials for excludeCredentials
    const { data: existingCredentials } = await supabase
      .from("passkey_credentials")
      .select("credential_id, transports")
      .eq("user_id", user.id);

    // Generate challenge
    const challenge = generateChallenge();

    // Store challenge
    await supabase.from("webauthn_challenges").insert({
      user_id: user.id,
      challenge,
      type: "registration",
    });

    // Get RP ID from request origin or use default
    const origin = req.headers.get("origin") || "";
    const rpId = new URL(origin).hostname || "localhost";

    // Create registration options
    const registrationOptions = {
      challenge,
      rp: {
        name: "Estoki WMS",
        id: rpId,
      },
      user: {
        id: btoa(user.id).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, ""),
        name: user.email || user.id,
        displayName: user.email?.split("@")[0] || "User",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      timeout: 60000,
      attestation: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: false,
        residentKey: "preferred",
        userVerification: "preferred",
      },
      excludeCredentials: existingCredentials?.map((cred) => ({
        id: cred.credential_id,
        type: "public-key",
        transports: cred.transports || ["internal"],
      })) || [],
    };

    console.log("Generated registration options for user:", user.id);

    return new Response(
      JSON.stringify({ options: registrationOptions, deviceName }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating registration options:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

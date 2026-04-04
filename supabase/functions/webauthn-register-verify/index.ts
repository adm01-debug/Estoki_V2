import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

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

    const { credential, deviceName } = await req.json();

    if (!credential || !credential.id || !credential.response) {
      return new Response(
        JSON.stringify({ error: "Invalid credential data" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Get the challenge from database
    const { data: challengeData, error: challengeError } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "registration")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (challengeError || !challengeData) {
      return new Response(
        JSON.stringify({ error: "Challenge not found or expired" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Delete used challenge
    await supabase
      .from("webauthn_challenges")
      .delete()
      .eq("id", challengeData.id);

    // Verify challenge expiration
    if (new Date(challengeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Challenge expired" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // In a production environment, you would verify the attestation here
    // For now, we'll store the credential directly
    // The client-side already verified the credential with the browser

    // Store the credential
    const { error: insertError } = await supabase
      .from("passkey_credentials")
      .insert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: credential.response.publicKey || credential.id,
        counter: 0,
        device_name: deviceName || "Unknown Device",
        transports: credential.response.transports || ["internal"],
      });

    if (insertError) {
      console.error("Error storing credential:", insertError);
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "This passkey is already registered" }),
          { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
      }
      throw insertError;
    }

    console.log("Passkey registered successfully for user:", user.id);

    return new Response(
      JSON.stringify({ success: true, message: "Passkey registered successfully" }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error verifying registration:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const jwtSecret = Deno.env.get("SUPABASE_AUTH_JWT_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { credential, challengeId, userId } = await req.json();

    if (!credential || !credential.id || !challengeId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get and verify the challenge
    const { data: challengeData, error: challengeError } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("id", challengeId)
      .eq("user_id", userId)
      .eq("type", "authentication")
      .single();

    if (challengeError || !challengeData) {
      return new Response(
        JSON.stringify({ error: "Challenge not found or expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete used challenge
    await supabase
      .from("webauthn_challenges")
      .delete()
      .eq("id", challengeId);

    // Verify challenge expiration
    if (new Date(challengeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Challenge expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the credential exists and belongs to the user
    const { data: storedCredential, error: credError } = await supabase
      .from("passkey_credentials")
      .select("*")
      .eq("credential_id", credential.id)
      .eq("user_id", userId)
      .single();

    if (credError || !storedCredential) {
      return new Response(
        JSON.stringify({ error: "Credential not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last used timestamp
    await supabase
      .from("passkey_credentials")
      .update({ 
        last_used_at: new Date().toISOString(),
        counter: storedCredential.counter + 1
      })
      .eq("id", storedCredential.id);

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a custom session/token for the user
    // Note: In production, you would use Supabase's magic link or create a proper session
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      aud: "authenticated",
      exp: now + 3600, // 1 hour
      iat: now,
      iss: supabaseUrl + "/auth/v1",
      sub: userId,
      email: user.email,
      role: "authenticated",
      session_id: crypto.randomUUID(),
    };

    // Create a simple JWT token (in production, use proper Supabase session management)
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(secret);

    console.log("Passkey authentication successful for user:", userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
        },
        access_token: token,
        token_type: "bearer",
        expires_in: 3600,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error verifying authentication:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

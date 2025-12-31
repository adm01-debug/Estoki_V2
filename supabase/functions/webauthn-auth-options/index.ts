import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw userError;
    }

    const user = users.users.find((u) => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's passkeys
    const { data: credentials, error: credError } = await supabase
      .from("passkey_credentials")
      .select("credential_id, transports")
      .eq("user_id", user.id);

    if (credError) {
      throw credError;
    }

    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ error: "No passkeys registered for this user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate challenge
    const challenge = generateChallenge();

    // Store challenge (without user_id since user is not authenticated yet)
    const { data: challengeRow } = await supabase
      .from("webauthn_challenges")
      .insert({
        user_id: user.id,
        challenge,
        type: "authentication",
      })
      .select()
      .single();

    // Get RP ID from request origin
    const origin = req.headers.get("origin") || "";
    const rpId = new URL(origin).hostname || "localhost";

    // Create authentication options
    const authenticationOptions = {
      challenge,
      rpId,
      timeout: 60000,
      userVerification: "preferred",
      allowCredentials: credentials.map((cred) => ({
        id: cred.credential_id,
        type: "public-key",
        transports: cred.transports || ["internal"],
      })),
    };

    console.log("Generated authentication options for email:", email);

    return new Response(
      JSON.stringify({ 
        options: authenticationOptions, 
        challengeId: challengeRow?.id,
        userId: user.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating authentication options:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

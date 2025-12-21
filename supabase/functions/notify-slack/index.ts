import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface SlackPayload {
  channel: string;
  text: string;
  blocks?: unknown[];
}

serve(async (req) => {
  try {
    const { event, data } = await req.json();
    const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: "Slack webhook not configured" }), { status: 500 });
    }

    const payload: SlackPayload = {
      channel: "#estoki-alerts",
      text: `[ESTOKI] ${event}: ${JSON.stringify(data)}`,
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

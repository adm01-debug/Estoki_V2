import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');

    if (!slackWebhookUrl) {
      return new Response(JSON.stringify({ error: 'Slack webhook não configurado' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { channel, message, tipo, dados } = await req.json();

    // Formatar mensagem para Slack
    const slackMessage = {
      channel: channel || '#estoki-alerts',
      username: 'ESTOKI Bot',
      icon_emoji: ':package:',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📦 ${tipo || 'Notificação ESTOKI'}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
      ],
    };

    if (dados) {
      slackMessage.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```' + JSON.stringify(dados, null, 2) + '```',
        },
      });
    }

    // Enviar para Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (!slackResponse.ok) {
      throw new Error('Falha ao enviar para Slack');
    }

    // Registrar notificação
    await supabase.from('notificacoes').insert({
      tipo: tipo || 'slack',
      titulo: 'Notificação Slack',
      mensagem: message,
      dados: { channel, dados },
      lida: true,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

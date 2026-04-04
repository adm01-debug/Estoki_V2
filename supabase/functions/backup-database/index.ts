import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tables = ['posicoes_estoque', 'eventos_triagem', 'recebimentos', 'gamificacao_usuarios', 'lotes'];
    const backup: Record<string, any[]> = {};

    for (const table of tables) {
      const { data } = await supabase.from(table).select('*');
      backup[table] = data || [];
    }

    const backupData = {
      timestamp: new Date().toISOString(),
      tables: Object.keys(backup),
      counts: Object.fromEntries(Object.entries(backup).map(([k, v]) => [k, v.length])),
      data: backup,
    };

    // Salvar no storage
    const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
    await supabase.storage
      .from('backups')
      .upload(fileName, JSON.stringify(backupData), { contentType: 'application/json', upsert: true });

    return new Response(JSON.stringify({
      success: true,
      fileName,
      tables: backupData.tables,
      counts: backupData.counts,
      timestamp: backupData.timestamp,
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});

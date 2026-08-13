require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  const { data: users } = await sb.auth.admin.listUsers();
  const { data: existingProfiles } = await sb.from('profiles').select('id');
  const existing = new Set(existingProfiles?.map(p => p.id) || []);

  let ok = 0, fail = 0;
  for (const u of users.users) {
    if (existing.has(u.id)) continue;
    const { error } = await sb.from('profiles').insert({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.nome || u.email.split('@')[0],
    });
    if (error) { console.log('FAIL', u.email, ':', error.message); fail++; }
    else { console.log('OK', u.email); ok++; }
  }
  console.log('profiles criados:', ok, 'FAIL:', fail);

  // agora seed das triagens
  const { data: lots } = await sb.from('lotes').select('id, numero_lote, status').limit(20);
  const { data: profs } = await sb.from('profiles').select('id, email');

  if (!lots?.length || !profs?.length) { console.log('sem dados'); return; }

  const hoje = new Date();
  const addH = h => new Date(hoje.getTime() - h * 3600000).toISOString();

  const cenarios = [
    { idx: 0, resultado: 'aprovado', data_inicio: addH(2), data_fim: addH(1.5), obs: 'Lote conforme' },
    { idx: 1, resultado: 'aprovado', data_inicio: addH(3), data_fim: addH(2.5), obs: 'OK sem divergencias' },
    { idx: 2, resultado: 'reprovado', data_inicio: addH(4), data_fim: addH(3.5), obs: 'Embalagem danificada' },
    { idx: 3, resultado: 'parcial', data_inicio: addH(5), data_fim: null, obs: 'Aguardando segunda amostra' },
    { idx: 4, resultado: 'conserto', data_inicio: addH(6), data_fim: addH(5.5), obs: 'Itens para retrabalho' },
    { idx: 5, resultado: 'aprovado', data_inicio: addH(8), data_fim: addH(7.5), obs: 'Conforme' },
    { idx: 6, resultado: 'aprovado', data_inicio: addH(10), data_fim: addH(9.5), obs: 'Aprovado em primeira' },
    { idx: 7, resultado: 'reprovado', data_inicio: addH(12), data_fim: addH(11.5), obs: 'Quantidade divergente' },
    { idx: 8, resultado: 'aprovado', data_inicio: addH(14), data_fim: addH(13.5), obs: 'OK' },
    { idx: 9, resultado: 'conserto', data_inicio: addH(16), data_fim: addH(15.5), obs: 'Necessita retrabalho' },
  ];

  let ok2 = 0, fail2 = 0;
  for (let i = 0; i < cenarios.length; i++) {
    const c = cenarios[i];
    const lote = lots[c.idx % lots.length];
    const op = profs[i % profs.length];
    const { error } = await sb.from('eventos_triagem').insert({
      lote_id: lote.id,
      operador_id: op.id,
      resultado: c.resultado,
      data_inicio: c.data_inicio,
      data_fim: c.data_fim,
      observacoes: c.obs,
    });
    if (error) { console.log('FAIL', lote.numero_lote, ':', error.message); fail2++; }
    else ok2++;
  }
  console.log('triagens criadas:', ok2, 'FAIL:', fail2);
  const { count } = await sb.from('eventos_triagem').select('*', { count: 'exact', head: true });
  console.log('total eventos_triagem:', count);
})();

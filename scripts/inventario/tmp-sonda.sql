-- Sonda temporaria (nao versionar): prova tabela, RPCs e ledger do banco oficial.
SELECT jsonb_build_object(
  'tabela_system_settings', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
             'nome', c.relname, 'rls', c.relrowsecurity,
             'policies', (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname))), '[]'::jsonb)
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname IN ('system_settings')
  ),
  'rpcs', (
    SELECT coalesce(jsonb_agg(p.proname ORDER BY p.proname), '[]'::jsonb)
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname IN ('iniciar_tarefa_picking', 'concluir_tarefa_picking')
  ),
  'ledger_max', to_char((SELECT max(version) FROM supabase_migrations.schema_migrations), 'FM99999999999999'),
  'ledger_registros', (SELECT count(*) FROM supabase_migrations.schema_migrations),
  'ledger_versoes', (SELECT coalesce(jsonb_agg(version ORDER BY version), '[]'::jsonb) FROM supabase_migrations.schema_migrations),
  'tabelas_public', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r'),
  'funcoes_public', (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public')
) AS sonda;
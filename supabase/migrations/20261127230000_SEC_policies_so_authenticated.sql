-- SEC: policies de identidade deixam de valer para a chave publica.
--
-- Medido em producao em 26/11/2026 (scripts/diag/probe-db.sh, SEC 9): das 82 policies
-- PERMISSIVE de `public` cujo role e `anon`/`public`, tres nao exigiam `auth.uid()` nem
-- unidade (efetivamente executaveis pela chave publica que vai no bundle do site):
--
--   entity_versions     :: entity_versions_insercao [INSERT] {public}
--        with check (tenant_id = effective_tenant_id() and (changed_by is null or changed_by = auth.uid()))
--        -> `changed_by is null` e TRUE para quem nao tem sessao, e `effective_tenant_id()`
--           cai em `default_tenant_id()` (select id from tenants where slug='default'), que
--           existe em producao (6bc5514a-9b19-43a5-9a57-89e873c6e07d). S? nao grava hoje
--           porque falta GRANT INSERT para `anon` -- o dia em que alguem conceder, anon
--           escreve historico de entidade no tenant padrao.
--   webauthn_challenges :: Users can only {insert,select,delete} their own challenges {public}
--        predicado `auth.uid() = user_id` -- com anon, auth.uid() e NULL e a comparacao
--        resolve NULL, logo nega. Correto na pratica, mas o role certo e `authenticated`.
--   desafios_usuarios   :: Usuarios podem {ver,atualizar} seus proprios desafios {public}
--        mesmo padrao de `auth.uid()`.
--
-- Efeito de negocio ao endurecer: nenhum. `service_role` nao passa por policy (BYPASSRLS) e
-- o app sempre chega com JWT de usuario, ou seja, role `authenticated`. A prova em
-- scripts/diag/probe-db.sh (SEC 8) mede, dentro do papel `anon`, 0 linha em
-- tarefas/produtos/clientes/user_roles.
--
-- Ficam de fora, de proposito:
--   `tenant_isolation` -> e RESTRICTIVE e e o proprio filtro por unidade (role public e o
--       unico jeito de a restritiva alcan?ar todas as linhas);
--   `login_attempts_deny_anon_all` -> permissiva de `anon` com predicado `false`, isto e,
--       negacao explicita.

do $bloco$
declare
  r record;
  n int := 0;
begin
  for r in
    select p.tablename, p.policyname
      from pg_policies p
     where p.schemaname = 'public'
       and p.permissive = 'PERMISSIVE'
       and p.policyname <> 'login_attempts_deny_anon_all'
       and exists (select 1 from unnest(p.roles) rr where rr::text in ('anon', 'public'))
       and (
         coalesce(p.qual, '') like '%auth.uid()%'
         or coalesce(p.with_check, '') like '%auth.uid()%'
         or p.tablename = 'entity_versions'
       )
     order by p.tablename, p.policyname
  loop
    execute format('alter policy %I on public.%I to authenticated', r.policyname, r.tablename);
    n := n + 1;
  end loop;
  raise notice 'policies restritas a authenticated: %', n;
end
$bloco$;

-- Prova: nao pode sobrar permissiva de anon/public fora da negacao explicita e do filtro de
-- unidade. Qualquer raise exception desfaz a migration inteira (roda numa transacao).
do $prova$
declare
  n int;
  lista text;
begin
  select count(*), coalesce(string_agg(p.tablename || ' :: ' || p.policyname, ' ;; '), '-')
    into n, lista
    from pg_policies p
   where p.schemaname = 'public'
     and p.permissive = 'PERMISSIVE'
     and p.policyname <> 'login_attempts_deny_anon_all'
     and p.policyname <> 'tenant_isolation'
     and exists (select 1 from unnest(p.roles) rr where rr::text in ('anon', 'public'));
  if n > 0 then
    raise exception 'ainda ha % permissiva(s) de anon/public: %', n, lista;
  end if;

  select count(*) into n
    from pg_policies p
   where p.schemaname = 'public'
     and p.tablename = 'entity_versions'
     and p.policyname = 'entity_versions_insercao'
     and exists (select 1 from unnest(p.roles) rr where rr::text = 'authenticated');
  if n <> 1 then
    raise exception 'entity_versions_insercao nao ficou restrita a authenticated';
  end if;

  raise notice 'PROVA OK';
end
$prova$;

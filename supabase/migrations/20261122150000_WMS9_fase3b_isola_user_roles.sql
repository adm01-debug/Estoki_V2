-- WMS-9 Fase 3b: isola public.user_roles por tenant.
--
-- A Fase 2 deixou user_roles de fora (junto com as demais tabelas de
-- identidade) porque um tenant_id mal aplicado ali travaria o login. A Fase 3
-- deu tenant_id a ela, mas as policies continuaram globais:
--
--   "Only admins can manage roles"  USING has_role(auth.uid(),'admin')
--   "View own or admin roles"       USING uid = user_id OR has_role(...,'admin')
--
-- Resultado medido em producao (transacao com rollback): um admin do tenant B
-- lia 1 role do tenant A e DELETE removia 1 linha do tenant A. As policies de
-- admin checam o papel sem olhar de qual tenant a linha e.
--
-- Correcao: uma policy RESTRICTIVE, igual ao padrao da Fase 2. RESTRICTIVE
-- combina por AND com as 5 policies existentes, que ficam intactas:
--   * ve/gerencia as roles do proprio tenant efetivo
--   * ve a propria role sempre (senao o app nao descobre o proprio papel
--     quando o claim ainda nao trouxe o tenant)
--   * role global (tenant_id NULL) continua visivel para admin, para nao
--     esconder as linhas legadas antes do backfill

DROP POLICY IF EXISTS user_roles_tenant_isolation ON public.user_roles;

CREATE POLICY user_roles_tenant_isolation ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    tenant_id IS NULL
    OR tenant_id = public.effective_tenant_id()
    OR user_id = auth.uid()
  )
  WITH CHECK (
    tenant_id IS NULL
    OR tenant_id = public.effective_tenant_id()
    OR user_id = auth.uid()
  );

-- A tela de automacoes (src/pages/admin/AutomacoesPage.tsx) aprova ou ignora uma
-- sugestao de reposicao: update em reorder_suggestions.status.
--
-- A tabela tem RLS habilitado e policy permissiva cobrindo UPDATE — "Authenticated
-- users can manage reorder suggestions" FOR ALL USING true WITH CHECK true
-- (20261121210700_SEC_rls_policies_suppliers_reorder_stock.sql:19), mais a
-- restrictiva tenant_isolation (20261122134000_WMS9_fase2_tenant_isolation.sql).
-- O que falta e o privilegio de tabela: o unico grant a authenticated foi
-- GRANT SELECT (20261121090000_EST01_stock-alert-backbone.sql:98), entao o UPDATE
-- falharia com 42501 mesmo com policy permitindo.
--
-- Concede apenas a coluna status (nao a linha inteira): a tela nao edita quantidade,
-- fornecedor nem estoque — so registra a decisao do comprador.

grant update (status) on public.reorder_suggestions to authenticated;

-- Reversao:
--   revoke update (status) on public.reorder_suggestions from authenticated;

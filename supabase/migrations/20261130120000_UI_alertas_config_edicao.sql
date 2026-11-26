-- Configurações de Alertas: popula as 8 regras que a tela (Alertas > Configurações)
-- lê e grava. Sem as linhas a tela fica vazia e o gerador de alertas não tem como
-- ser ligado/desligado por tipo. Idempotente: só insere o tipo que ainda não existe.

GRANT SELECT, INSERT, UPDATE ON public.alertas_config TO authenticated;

INSERT INTO public.alertas_config (tipo, ativo, threshold_valor, threshold_dias, severidade, descricao)
VALUES
  ('estoque_minimo'::public.tipo_alerta, true, NULL, NULL, 'critico'::public.severidade_alerta, 'Alerta quando estoque atinge nível mínimo'),
  ('estoque_maximo'::public.tipo_alerta, true, NULL, NULL, 'aviso'::public.severidade_alerta, 'Alerta quando estoque excede nível máximo'),
  ('ponto_pedido'::public.tipo_alerta, true, NULL, NULL, 'aviso'::public.severidade_alerta, 'Alerta quando estoque atinge ponto de pedido'),
  ('posicao_ociosa'::public.tipo_alerta, true, NULL, 30, 'info'::public.severidade_alerta, 'Alerta para posições sem movimentação há X dias'),
  ('vencimento_proximo'::public.tipo_alerta, true, NULL, 30, 'critico'::public.severidade_alerta, 'Alerta para lotes próximos ao vencimento'),
  ('gargalo_triagem'::public.tipo_alerta, true, 10, NULL, 'urgente'::public.severidade_alerta, 'Alerta quando há muitos itens pendentes na triagem'),
  ('divergencia_inventario'::public.tipo_alerta, true, 5, NULL, 'critico'::public.severidade_alerta, 'Alerta quando divergência excede threshold'),
  ('item_sem_movimentacao'::public.tipo_alerta, true, NULL, 60, 'info'::public.severidade_alerta, 'Alerta para itens sem movimentação há X dias')
ON CONFLICT (tipo) DO NOTHING;

-- Prova: as 8 regras existem, uma por tipo, e o admin consegue editar (policy de escrita).
DO $prova$
DECLARE
  total INT;
  distintos INT;
  policies_escrita INT;
  rls_on BOOLEAN;
BEGIN
  SELECT count(*), count(DISTINCT tipo) INTO total, distintos FROM public.alertas_config;
  IF total <> 8 OR distintos <> 8 THEN
    RAISE EXCEPTION 'alertas_config com % linhas e % tipos distintos (esperado 8 e 8)', total, distintos;
  END IF;

  SELECT count(*) INTO policies_escrita
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'alertas_config'
    AND cmd IN ('ALL', 'INSERT', 'UPDATE')
    AND roles::text LIKE '%authenticated%';
  IF policies_escrita < 2 THEN
    RAISE EXCEPTION 'alertas_config sem policy de edicao para authenticated (encontradas %)', policies_escrita;
  END IF;

  SELECT relrowsecurity INTO rls_on FROM pg_class WHERE oid = 'public.alertas_config'::regclass;
  IF NOT rls_on THEN
    RAISE EXCEPTION 'RLS desabilitado em alertas_config';
  END IF;
END
$prova$;

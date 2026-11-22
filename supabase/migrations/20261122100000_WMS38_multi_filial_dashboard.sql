-- WMS-38 / Multi-tenant Fase 2 (incremental, aditivo e retrocompativel)
-- Objetivo: vincular o estoque operacional a filiais (public.armazens) SEM alterar
-- nenhuma policy existente. Colunas nullable + backfill para o CD principal (ARM-01).
-- Nenhuma linha e removida; nenhuma policy e substituida.

-- 1) Vinculo de filial nas tabelas operacionais
ALTER TABLE public.posicoes_estoque
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.armazens(id) ON DELETE SET NULL;

ALTER TABLE public.lotes
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.armazens(id) ON DELETE SET NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.armazens(id) ON DELETE SET NULL;

ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.armazens(id) ON DELETE SET NULL;

-- 2) Backfill: dados historicos pertencem ao CD principal (ARM-01).
--    COALESCE respeita valor ja existente (idempotente, nao sobrescreve dado real).
UPDATE public.posicoes_estoque
   SET warehouse_id = (SELECT id FROM public.armazens WHERE codigo = 'ARM-01' LIMIT 1)
 WHERE warehouse_id IS NULL;

UPDATE public.lotes
   SET warehouse_id = (SELECT id FROM public.armazens WHERE codigo = 'ARM-01' LIMIT 1)
 WHERE warehouse_id IS NULL;

UPDATE public.orders
   SET warehouse_id = (SELECT id FROM public.armazens WHERE codigo = 'ARM-01' LIMIT 1)
 WHERE warehouse_id IS NULL;

UPDATE public.tarefas
   SET warehouse_id = (SELECT id FROM public.armazens WHERE codigo = 'ARM-01' LIMIT 1)
 WHERE warehouse_id IS NULL;

-- 3) Indices de agregacao por filial
CREATE INDEX IF NOT EXISTS idx_posicoes_estoque_warehouse ON public.posicoes_estoque(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_lotes_warehouse ON public.lotes(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_warehouse ON public.orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_warehouse ON public.tarefas(warehouse_id);

-- 4) RPC de dashboard gerencial multi-filial (comparativo por armazem)
CREATE OR REPLACE FUNCTION public.get_multi_warehouse_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')) THEN
    RAISE EXCEPTION 'Acesso restrito a administradores e supervisores';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.codigo), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      a.id                AS armazem_id,
      a.codigo            AS codigo,
      a.nome              AS nome,
      a.cidade            AS cidade,
      a.estado            AS estado,
      a.ativo             AS ativo,
      a.capacidade_total  AS capacidade_total,
      COALESCE(p.total_posicoes, 0)   AS total_posicoes,
      COALESCE(p.posicoes_ocupadas, 0) AS posicoes_ocupadas,
      CASE WHEN COALESCE(p.total_posicoes,0) > 0
           THEN ROUND((p.posicoes_ocupadas::numeric * 100) / p.total_posicoes, 1)
           ELSE 0 END      AS taxa_ocupacao,
      COALESCE(l.total_lotes, 0)      AS total_lotes,
      COALESCE(l.quantidade_estoque, 0) AS quantidade_estoque,
      COALESCE(o.orders_pendentes, 0) AS orders_pendentes,
      COALESCE(o.orders_total, 0)     AS orders_total,
      COALESCE(t.tarefas_abertas, 0)  AS tarefas_abertas,
      COALESCE(t.tarefas_total, 0)    AS tarefas_total
    FROM public.armazens a
    LEFT JOIN (
      SELECT warehouse_id,
             count(*) AS total_posicoes,
             count(*) FILTER (WHERE status = 'ocupado') AS posicoes_ocupadas
      FROM public.posicoes_estoque
      GROUP BY warehouse_id
    ) p ON p.warehouse_id = a.id
    LEFT JOIN (
      SELECT warehouse_id,
             count(*) AS total_lotes,
             COALESCE(sum(quantidade_atual), 0) AS quantidade_estoque
      FROM public.lotes
      GROUP BY warehouse_id
    ) l ON l.warehouse_id = a.id
    LEFT JOIN (
      SELECT warehouse_id,
             count(*) AS orders_total,
             count(*) FILTER (WHERE status IN ('pendente','em_separacao','embalagem')) AS orders_pendentes
      FROM public.orders
      GROUP BY warehouse_id
    ) o ON o.warehouse_id = a.id
    LEFT JOIN (
      SELECT warehouse_id,
             count(*) AS tarefas_total,
             count(*) FILTER (WHERE status NOT IN ('concluida','cancelada')) AS tarefas_abertas
      FROM public.tarefas
      GROUP BY warehouse_id
    ) t ON t.warehouse_id = a.id
  ) t;

  RETURN jsonb_build_object('filiais', v_result, 'generated_at', now());
END;
$fn$;

REVOKE ALL ON FUNCTION public.get_multi_warehouse_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_multi_warehouse_dashboard() TO authenticated, service_role;
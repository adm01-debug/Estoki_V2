-- Setor de conserto: a tela de retrabalho passa a gravar de verdade.
--
-- Antes desta migration as duas tabelas do fluxo de conserto (`recuperacao_materiais` e
-- `setores_checkpoint`) existiam com RLS ligado e policy `FOR ALL TO authenticated`, mas
-- nenhum GRANT de tabela e nenhuma regra de negocio: recuperar 10 unidades de um lote de 5
-- era aceito pelo banco, e o operador podia ficar preso com quantidade_recuperada +
-- quantidade_perda acima do que entrou no setor.

-- 1. Acesso explicito (a policy existe, o privilegio de tabela e que faltava).
GRANT SELECT, INSERT, UPDATE ON public.recuperacao_materiais TO authenticated;
GRANT SELECT, INSERT ON public.setores_checkpoint TO authenticated;

-- 2. Regras de negocio do conserto.
DO $regras$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recuperacao_qtd_original_positiva') THEN
    ALTER TABLE public.recuperacao_materiais
      ADD CONSTRAINT recuperacao_qtd_original_positiva CHECK (quantidade_original > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recuperacao_qtd_nao_negativas') THEN
    ALTER TABLE public.recuperacao_materiais
      ADD CONSTRAINT recuperacao_qtd_nao_negativas
      CHECK (coalesce(quantidade_recuperada, 0) >= 0 AND coalesce(quantidade_perda, 0) >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recuperacao_nao_excede_original') THEN
    ALTER TABLE public.recuperacao_materiais
      ADD CONSTRAINT recuperacao_nao_excede_original
      CHECK (coalesce(quantidade_recuperada, 0) + coalesce(quantidade_perda, 0) <= quantidade_original);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recuperacao_status_valido') THEN
    ALTER TABLE public.recuperacao_materiais
      ADD CONSTRAINT recuperacao_status_valido
      CHECK (status IS NULL OR status IN ('em_recuperacao', 'recuperado', 'sucata'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkpoint_setores_distintos') THEN
    ALTER TABLE public.setores_checkpoint
      ADD CONSTRAINT checkpoint_setores_distintos CHECK (setor_origem <> setor_destino);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkpoint_quantidade_positiva') THEN
    ALTER TABLE public.setores_checkpoint
      ADD CONSTRAINT checkpoint_quantidade_positiva CHECK (quantidade > 0);
  END IF;
END $regras$;

-- 3. Indices para as consultas reais da tela (fila por status, timeline por lote).
CREATE INDEX IF NOT EXISTS idx_recuperacao_status_created
  ON public.recuperacao_materiais (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recuperacao_lote
  ON public.recuperacao_materiais (lote_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_lote_created
  ON public.setores_checkpoint (lote_id, created_at DESC);

-- 4. Prova: se qualquer item estiver faltando, a migration inteira e revertida.
DO $prova$
DECLARE faltam text[] := ARRAY[]::text[];
BEGIN
  IF (SELECT count(*) FROM pg_constraint WHERE conname IN (
        'recuperacao_qtd_original_positiva', 'recuperacao_qtd_nao_negativas',
        'recuperacao_nao_excede_original', 'recuperacao_status_valido',
        'checkpoint_setores_distintos', 'checkpoint_quantidade_positiva')) <> 6 THEN
    faltam := array_append(faltam, 'constraints de conserto');
  END IF;

  IF (SELECT count(*) FROM pg_indexes
      WHERE schemaname = 'public' AND indexname IN (
        'idx_recuperacao_status_created', 'idx_recuperacao_lote', 'idx_checkpoint_lote_created')) <> 3 THEN
    faltam := array_append(faltam, 'indices');
  END IF;

  IF NOT (has_table_privilege('authenticated', 'public.recuperacao_materiais', 'SELECT')
      AND has_table_privilege('authenticated', 'public.recuperacao_materiais', 'INSERT')
      AND has_table_privilege('authenticated', 'public.recuperacao_materiais', 'UPDATE')) THEN
    faltam := array_append(faltam, 'grant em recuperacao_materiais');
  END IF;

  IF NOT (has_table_privilege('authenticated', 'public.setores_checkpoint', 'SELECT')
      AND has_table_privilege('authenticated', 'public.setores_checkpoint', 'INSERT')) THEN
    faltam := array_append(faltam, 'grant em setores_checkpoint');
  END IF;

  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'recuperacao_materiais') = 0 THEN
    faltam := array_append(faltam, 'policy de recuperacao_materiais');
  END IF;

  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'setores_checkpoint') = 0 THEN
    faltam := array_append(faltam, 'policy de setores_checkpoint');
  END IF;

  IF array_length(faltam, 1) > 0 THEN
    RAISE EXCEPTION 'setor de conserto incompleto: %', array_to_string(faltam, ', ');
  END IF;
END $prova$;

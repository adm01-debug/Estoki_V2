-- Função para atualizar progresso dos desafios diários
CREATE OR REPLACE FUNCTION public.trigger_atualizar_desafios()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_desafio RECORD;
  v_progresso_atual integer;
  v_contagem integer;
  v_hoje date := CURRENT_DATE;
BEGIN
  -- Para cada desafio ativo do dia
  FOR v_desafio IN 
    SELECT dd.id, dd.tipo, dd.meta, dd.xp_recompensa,
           COALESCE(du.progresso, 0) as progresso,
           COALESCE(du.concluido, false) as concluido,
           du.id as usuario_desafio_id
    FROM public.desafios_diarios dd
    LEFT JOIN public.desafios_usuarios du ON du.desafio_id = dd.id AND du.user_id = NEW.user_id
    WHERE dd.data_ativo = v_hoje AND dd.ativo = true
  LOOP
    -- Pula desafios já concluídos
    IF v_desafio.concluido THEN
      CONTINUE;
    END IF;
    
    v_progresso_atual := v_desafio.progresso;
    
    -- Atualiza progresso baseado no tipo do desafio
    CASE v_desafio.tipo
      -- Desafios de triagem
      WHEN 'triagem' THEN
        IF NEW.tipo = 'triagem' THEN
          SELECT COUNT(*) INTO v_contagem 
          FROM public.xp_historico 
          WHERE user_id = NEW.user_id 
            AND tipo = 'triagem'
            AND DATE(created_at) = v_hoje;
          v_progresso_atual := v_contagem;
        END IF;
        
      -- Desafios de tarefas
      WHEN 'tarefa' THEN
        IF NEW.tipo = 'tarefa' THEN
          SELECT COUNT(*) INTO v_contagem 
          FROM public.xp_historico 
          WHERE user_id = NEW.user_id 
            AND tipo = 'tarefa'
            AND DATE(created_at) = v_hoje;
          v_progresso_atual := v_contagem;
        END IF;
        
      -- Desafios de XP
      WHEN 'xp' THEN
        SELECT COALESCE(SUM(quantidade), 0) INTO v_contagem 
        FROM public.xp_historico 
        WHERE user_id = NEW.user_id 
          AND DATE(created_at) = v_hoje;
        v_progresso_atual := v_contagem;
        
      -- Desafios de velocidade (triagens rápidas)
      WHEN 'velocidade' THEN
        IF NEW.tipo = 'triagem' AND NEW.descricao LIKE '%ultra-rápida%' THEN
          SELECT COUNT(*) INTO v_contagem 
          FROM public.xp_historico 
          WHERE user_id = NEW.user_id 
            AND tipo = 'triagem'
            AND descricao LIKE '%ultra-rápida%'
            AND DATE(created_at) = v_hoje;
          v_progresso_atual := v_contagem;
        END IF;
        
      -- Desafios de qualidade (triagens aprovadas)
      WHEN 'qualidade' THEN
        IF NEW.tipo = 'triagem' THEN
          SELECT COUNT(*) INTO v_contagem 
          FROM public.eventos_triagem 
          WHERE operador_id = NEW.user_id 
            AND resultado = 'aprovado'
            AND DATE(data_fim) = v_hoje;
          v_progresso_atual := v_contagem;
        END IF;
        
      -- Desafios de streak (manter streak ativo)
      WHEN 'streak' THEN
        SELECT streak_atual INTO v_contagem 
        FROM public.streaks_usuarios 
        WHERE user_id = NEW.user_id;
        v_progresso_atual := COALESCE(v_contagem, 0);
        
      -- Outros tipos - incrementa se tipo bater
      ELSE
        IF NEW.tipo = v_desafio.tipo THEN
          v_progresso_atual := v_desafio.progresso + 1;
        END IF;
    END CASE;
    
    -- Se houve mudança no progresso
    IF v_progresso_atual != v_desafio.progresso OR v_desafio.usuario_desafio_id IS NULL THEN
      -- Upsert no progresso do desafio
      INSERT INTO public.desafios_usuarios (user_id, desafio_id, progresso, concluido, data_conclusao)
      VALUES (
        NEW.user_id, 
        v_desafio.id, 
        v_progresso_atual,
        v_progresso_atual >= v_desafio.meta,
        CASE WHEN v_progresso_atual >= v_desafio.meta THEN now() ELSE NULL END
      )
      ON CONFLICT (user_id, desafio_id) 
      DO UPDATE SET 
        progresso = v_progresso_atual,
        concluido = v_progresso_atual >= v_desafio.meta,
        data_conclusao = CASE 
          WHEN v_progresso_atual >= v_desafio.meta AND desafios_usuarios.data_conclusao IS NULL 
          THEN now() 
          ELSE desafios_usuarios.data_conclusao 
        END,
        updated_at = now();
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Adicionar constraint única para desafios_usuarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'desafios_usuarios_user_desafio_unique'
  ) THEN
    ALTER TABLE public.desafios_usuarios
    ADD CONSTRAINT desafios_usuarios_user_desafio_unique UNIQUE (user_id, desafio_id);
  END IF;
END $$;

-- Trigger que dispara quando XP é ganho (após inserção em xp_historico)
DROP TRIGGER IF EXISTS trigger_desafios_on_xp ON public.xp_historico;
CREATE TRIGGER trigger_desafios_on_xp
  AFTER INSERT ON public.xp_historico
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_atualizar_desafios();

-- Inserir alguns desafios diários de exemplo para hoje
INSERT INTO public.desafios_diarios (tipo, titulo, descricao, meta, xp_recompensa, dificuldade, data_ativo)
VALUES 
  ('triagem', 'Triador Iniciante', 'Complete 5 triagens hoje', 5, 50, 'facil', CURRENT_DATE),
  ('triagem', 'Mestre da Triagem', 'Complete 15 triagens hoje', 15, 150, 'dificil', CURRENT_DATE),
  ('tarefa', 'Executor de Tarefas', 'Complete 3 tarefas hoje', 3, 75, 'normal', CURRENT_DATE),
  ('velocidade', 'Velocista', 'Faça 3 triagens ultra-rápidas', 3, 100, 'dificil', CURRENT_DATE),
  ('xp', 'Coletor de XP', 'Ganhe 100 XP hoje', 100, 50, 'normal', CURRENT_DATE)
ON CONFLICT DO NOTHING;
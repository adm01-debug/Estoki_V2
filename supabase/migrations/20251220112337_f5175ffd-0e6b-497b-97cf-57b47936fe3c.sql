-- Trigger function para atualizar progresso das conquistas quando XP é ganho
CREATE OR REPLACE FUNCTION public.trigger_atualizar_conquistas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conquista RECORD;
  v_progresso_atual integer;
  v_novo_progresso integer;
  v_contagem integer;
BEGIN
  -- Para cada conquista ativa do usuário
  FOR v_conquista IN 
    SELECT cd.id, cd.codigo, cd.criterio, cd.meta, cd.pontos,
           COALESCE(cu.progresso, 0) as progresso,
           COALESCE(cu.desbloqueada, false) as desbloqueada
    FROM public.conquistas_definicoes cd
    LEFT JOIN public.conquistas_usuarios cu ON cu.conquista_id = cd.id AND cu.user_id = NEW.user_id
    WHERE cd.ativo = true
  LOOP
    -- Pula conquistas já desbloqueadas
    IF v_conquista.desbloqueada THEN
      CONTINUE;
    END IF;
    
    v_novo_progresso := v_conquista.progresso;
    
    -- Atualiza progresso baseado no critério
    CASE v_conquista.criterio
      -- Conquistas baseadas em contagem de triagens
      WHEN 'triagens_completadas' THEN
        IF NEW.tipo = 'triagem' THEN
          SELECT COUNT(*) INTO v_contagem 
          FROM public.xp_historico 
          WHERE user_id = NEW.user_id AND tipo = 'triagem';
          v_novo_progresso := v_contagem;
        END IF;
        
      -- Conquistas baseadas em contagem de tarefas
      WHEN 'tarefas_completadas' THEN
        IF NEW.tipo = 'tarefa' THEN
          SELECT COUNT(*) INTO v_contagem 
          FROM public.xp_historico 
          WHERE user_id = NEW.user_id AND tipo = 'tarefa';
          v_novo_progresso := v_contagem;
        END IF;
        
      -- Conquistas baseadas em XP total
      WHEN 'xp_total' THEN
        SELECT xp_total INTO v_contagem 
        FROM public.gamificacao_usuarios 
        WHERE user_id = NEW.user_id;
        v_novo_progresso := COALESCE(v_contagem, 0);
        
      -- Conquistas baseadas em nível
      WHEN 'nivel_alcancado' THEN
        SELECT nivel INTO v_contagem 
        FROM public.gamificacao_usuarios 
        WHERE user_id = NEW.user_id;
        v_novo_progresso := COALESCE(v_contagem, 0);
        
      -- Conquistas baseadas em streak
      WHEN 'streak_dias' THEN
        SELECT streak_atual INTO v_contagem 
        FROM public.streaks_usuarios 
        WHERE user_id = NEW.user_id;
        v_novo_progresso := COALESCE(v_contagem, 0);
        
      -- Conquistas baseadas em desafios completados
      WHEN 'desafios_completados' THEN
        SELECT COUNT(*) INTO v_contagem 
        FROM public.desafios_usuarios 
        WHERE user_id = NEW.user_id AND concluido = true;
        v_novo_progresso := v_contagem;
        
      -- Conquistas baseadas em triagens perfeitas (aprovadas + rápidas)
      WHEN 'triagens_perfeitas' THEN
        IF NEW.tipo = 'triagem' AND NEW.descricao LIKE '%bônus%' THEN
          SELECT COUNT(*) INTO v_contagem 
          FROM public.xp_historico 
          WHERE user_id = NEW.user_id 
            AND tipo = 'triagem' 
            AND descricao LIKE '%bônus%';
          v_novo_progresso := v_contagem;
        END IF;
        
      ELSE
        -- Critérios desconhecidos - incrementa se tipo bater
        IF NEW.tipo = v_conquista.criterio THEN
          v_novo_progresso := v_conquista.progresso + 1;
        END IF;
    END CASE;
    
    -- Se houve mudança no progresso
    IF v_novo_progresso != v_conquista.progresso THEN
      -- Upsert no progresso da conquista
      INSERT INTO public.conquistas_usuarios (user_id, conquista_id, progresso, desbloqueada, data_desbloqueio)
      VALUES (
        NEW.user_id, 
        v_conquista.id, 
        v_novo_progresso,
        v_novo_progresso >= v_conquista.meta,
        CASE WHEN v_novo_progresso >= v_conquista.meta THEN now() ELSE NULL END
      )
      ON CONFLICT (user_id, conquista_id) 
      DO UPDATE SET 
        progresso = v_novo_progresso,
        desbloqueada = v_novo_progresso >= v_conquista.meta,
        data_desbloqueio = CASE 
          WHEN v_novo_progresso >= v_conquista.meta AND conquistas_usuarios.data_desbloqueio IS NULL 
          THEN now() 
          ELSE conquistas_usuarios.data_desbloqueio 
        END,
        updated_at = now();
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Cria o trigger na tabela xp_historico
DROP TRIGGER IF EXISTS trigger_conquistas_on_xp ON public.xp_historico;

CREATE TRIGGER trigger_conquistas_on_xp
  AFTER INSERT ON public.xp_historico
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_atualizar_conquistas();

-- Adiciona unique constraint para permitir upsert
ALTER TABLE public.conquistas_usuarios 
DROP CONSTRAINT IF EXISTS conquistas_usuarios_user_conquista_unique;

ALTER TABLE public.conquistas_usuarios 
ADD CONSTRAINT conquistas_usuarios_user_conquista_unique 
UNIQUE (user_id, conquista_id);

-- Atualiza critérios das conquistas existentes para bater com o trigger
UPDATE public.conquistas_definicoes SET criterio = 'triagens_completadas' WHERE codigo IN ('PRIMEIRA_TRIAGEM', 'TRIADOR_10', 'TRIADOR_50', 'TRIADOR_100', 'MESTRE_TRIAGEM');
UPDATE public.conquistas_definicoes SET criterio = 'tarefas_completadas' WHERE codigo IN ('SEPARADOR_INICIANTE', 'SEPARADOR_EXPERIENTE');
UPDATE public.conquistas_definicoes SET criterio = 'streak_dias' WHERE codigo IN ('STREAK_3', 'STREAK_7', 'STREAK_30');
UPDATE public.conquistas_definicoes SET criterio = 'nivel_alcancado' WHERE codigo IN ('NIVEL_5', 'NIVEL_10');
UPDATE public.conquistas_definicoes SET criterio = 'xp_total' WHERE codigo = 'XP_1000';
UPDATE public.conquistas_definicoes SET criterio = 'triagens_perfeitas' WHERE codigo = 'PERFECCIONISTA';
-- Trigger function para conceder XP ao completar triagem
CREATE OR REPLACE FUNCTION public.trigger_xp_triagem_completa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_base integer := 15;
  v_xp_bonus integer := 0;
  v_tempo_minutos integer;
  v_descricao text;
BEGIN
  -- Só executa quando data_fim é preenchido (triagem finalizada)
  IF NEW.data_fim IS NOT NULL AND (OLD.data_fim IS NULL OR TG_OP = 'INSERT') THEN
    -- Verifica se tem operador_id
    IF NEW.operador_id IS NOT NULL THEN
      -- Calcula tempo da triagem em minutos
      v_tempo_minutos := EXTRACT(EPOCH FROM (NEW.data_fim - NEW.data_inicio)) / 60;
      
      -- Bônus por velocidade (triagem rápida = mais XP)
      IF v_tempo_minutos <= 2 THEN
        v_xp_bonus := 10; -- Triagem ultra-rápida
      ELSIF v_tempo_minutos <= 5 THEN
        v_xp_bonus := 5; -- Triagem rápida
      END IF;
      
      -- Bônus por resultado aprovado
      IF NEW.resultado = 'aprovado' THEN
        v_xp_bonus := v_xp_bonus + 5;
      END IF;
      
      -- Monta descrição
      v_descricao := 'Triagem concluída';
      IF v_xp_bonus > 0 THEN
        v_descricao := v_descricao || ' (+' || v_xp_bonus || ' bônus)';
      END IF;
      
      -- Adiciona XP usando a função existente
      PERFORM public.adicionar_xp(
        NEW.operador_id,
        v_xp_base + v_xp_bonus,
        'triagem',
        v_descricao,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Cria o trigger na tabela eventos_triagem
DROP TRIGGER IF EXISTS trigger_xp_on_triagem_complete ON public.eventos_triagem;

CREATE TRIGGER trigger_xp_on_triagem_complete
  AFTER INSERT OR UPDATE ON public.eventos_triagem
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_xp_triagem_completa();

-- Trigger para XP ao completar tarefas de separação/picking
CREATE OR REPLACE FUNCTION public.trigger_xp_tarefa_completa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_base integer := 20;
  v_xp_bonus integer := 0;
  v_descricao text;
BEGIN
  -- Só executa quando status muda para 'concluida'
  IF NEW.status = 'concluida' AND (OLD.status IS NULL OR OLD.status != 'concluida') THEN
    -- Verifica se tem operador_id
    IF NEW.operador_id IS NOT NULL THEN
      -- Bônus por prioridade
      CASE NEW.prioridade
        WHEN 'urgente' THEN v_xp_bonus := 15;
        WHEN 'alta' THEN v_xp_bonus := 10;
        WHEN 'media' THEN v_xp_bonus := 5;
        ELSE v_xp_bonus := 0;
      END CASE;
      
      -- Bônus por quantidade executada corretamente
      IF NEW.quantidade_executada = NEW.quantidade THEN
        v_xp_bonus := v_xp_bonus + 10;
      END IF;
      
      -- Monta descrição baseada no tipo
      v_descricao := 'Tarefa ' || NEW.tipo || ' concluída';
      IF v_xp_bonus > 0 THEN
        v_descricao := v_descricao || ' (+' || v_xp_bonus || ' bônus)';
      END IF;
      
      -- Adiciona XP
      PERFORM public.adicionar_xp(
        NEW.operador_id,
        v_xp_base + v_xp_bonus,
        'tarefa',
        v_descricao,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Cria o trigger na tabela tarefas
DROP TRIGGER IF EXISTS trigger_xp_on_tarefa_complete ON public.tarefas;

CREATE TRIGGER trigger_xp_on_tarefa_complete
  AFTER INSERT OR UPDATE ON public.tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_xp_tarefa_completa();
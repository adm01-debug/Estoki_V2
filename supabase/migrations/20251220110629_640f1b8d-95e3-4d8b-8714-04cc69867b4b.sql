-- Create table for user XP and levels
CREATE TABLE public.gamificacao_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_total integer NOT NULL DEFAULT 0,
  nivel integer NOT NULL DEFAULT 1,
  xp_proximo_nivel integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for achievements definitions
CREATE TABLE public.conquistas_definicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text NOT NULL,
  icone text NOT NULL DEFAULT 'Trophy',
  raridade text NOT NULL DEFAULT 'comum' CHECK (raridade IN ('comum', 'raro', 'epico', 'lendario')),
  categoria text NOT NULL DEFAULT 'geral' CHECK (categoria IN ('produtividade', 'qualidade', 'consistencia', 'especial', 'sazonal')),
  pontos integer NOT NULL DEFAULT 10,
  meta integer,
  criterio text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for user achievements
CREATE TABLE public.conquistas_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conquista_id uuid NOT NULL REFERENCES public.conquistas_definicoes(id) ON DELETE CASCADE,
  progresso integer NOT NULL DEFAULT 0,
  desbloqueada boolean NOT NULL DEFAULT false,
  data_desbloqueio timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, conquista_id)
);

-- Create table for streaks
CREATE TABLE public.streaks_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_atual integer NOT NULL DEFAULT 0,
  streak_recorde integer NOT NULL DEFAULT 0,
  ultimo_checkin date,
  xp_bonus_coletado integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for streak history/calendar
CREATE TABLE public.streaks_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data date NOT NULL,
  xp_ganho integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, data)
);

-- Create table for daily challenges
CREATE TABLE public.desafios_diarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text NOT NULL,
  tipo text NOT NULL,
  meta integer NOT NULL,
  xp_recompensa integer NOT NULL DEFAULT 50,
  dificuldade text NOT NULL DEFAULT 'normal' CHECK (dificuldade IN ('facil', 'normal', 'dificil')),
  data_ativo date NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for user daily challenges progress
CREATE TABLE public.desafios_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  desafio_id uuid NOT NULL REFERENCES public.desafios_diarios(id) ON DELETE CASCADE,
  progresso integer NOT NULL DEFAULT 0,
  concluido boolean NOT NULL DEFAULT false,
  xp_coletado boolean NOT NULL DEFAULT false,
  data_conclusao timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, desafio_id)
);

-- Create table for XP transactions log
CREATE TABLE public.xp_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantidade integer NOT NULL,
  tipo text NOT NULL,
  descricao text NOT NULL,
  referencia_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.gamificacao_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas_definicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desafios_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desafios_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_historico ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gamificacao_usuarios
CREATE POLICY "Users can view all gamification data for rankings"
ON public.gamificacao_usuarios FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own gamification data"
ON public.gamificacao_usuarios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification data"
ON public.gamificacao_usuarios FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for conquistas_definicoes (everyone can read)
CREATE POLICY "Anyone can view achievement definitions"
ON public.conquistas_definicoes FOR SELECT
USING (true);

CREATE POLICY "Admins can manage achievement definitions"
ON public.conquistas_definicoes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for conquistas_usuarios
CREATE POLICY "Users can view all achievements for rankings"
ON public.conquistas_usuarios FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own achievements"
ON public.conquistas_usuarios FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for streaks_usuarios
CREATE POLICY "Users can view all streaks for rankings"
ON public.streaks_usuarios FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own streaks"
ON public.streaks_usuarios FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for streaks_historico
CREATE POLICY "Users can view their own streak history"
ON public.streaks_historico FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streak history"
ON public.streaks_historico FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for desafios_diarios (everyone can read active challenges)
CREATE POLICY "Anyone can view active daily challenges"
ON public.desafios_diarios FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage daily challenges"
ON public.desafios_diarios FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for desafios_usuarios
CREATE POLICY "Users can view their own challenge progress"
ON public.desafios_usuarios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own challenge progress"
ON public.desafios_usuarios FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for xp_historico
CREATE POLICY "Users can view their own XP history"
ON public.xp_historico FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP history"
ON public.xp_historico FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_gamificacao_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_gamificacao_usuarios_updated_at
BEFORE UPDATE ON public.gamificacao_usuarios
FOR EACH ROW EXECUTE FUNCTION public.update_gamificacao_updated_at();

CREATE TRIGGER update_conquistas_usuarios_updated_at
BEFORE UPDATE ON public.conquistas_usuarios
FOR EACH ROW EXECUTE FUNCTION public.update_gamificacao_updated_at();

CREATE TRIGGER update_streaks_usuarios_updated_at
BEFORE UPDATE ON public.streaks_usuarios
FOR EACH ROW EXECUTE FUNCTION public.update_gamificacao_updated_at();

CREATE TRIGGER update_desafios_usuarios_updated_at
BEFORE UPDATE ON public.desafios_usuarios
FOR EACH ROW EXECUTE FUNCTION public.update_gamificacao_updated_at();

-- Function to add XP to user (handles level ups)
CREATE OR REPLACE FUNCTION public.adicionar_xp(
  p_user_id uuid,
  p_quantidade integer,
  p_tipo text,
  p_descricao text,
  p_referencia_id uuid DEFAULT NULL
)
RETURNS public.gamificacao_usuarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario public.gamificacao_usuarios;
  v_novo_xp integer;
  v_nivel_atual integer;
  v_xp_proximo integer;
BEGIN
  -- Get or create user gamification record
  INSERT INTO public.gamificacao_usuarios (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_usuario FROM public.gamificacao_usuarios WHERE user_id = p_user_id;
  
  v_novo_xp := v_usuario.xp_total + p_quantidade;
  v_nivel_atual := v_usuario.nivel;
  v_xp_proximo := v_usuario.xp_proximo_nivel;
  
  -- Check for level ups
  WHILE v_novo_xp >= v_xp_proximo LOOP
    v_novo_xp := v_novo_xp - v_xp_proximo;
    v_nivel_atual := v_nivel_atual + 1;
    v_xp_proximo := v_nivel_atual * 100; -- Each level requires level * 100 XP
  END LOOP;
  
  -- Update user
  UPDATE public.gamificacao_usuarios
  SET xp_total = v_novo_xp,
      nivel = v_nivel_atual,
      xp_proximo_nivel = v_xp_proximo
  WHERE user_id = p_user_id
  RETURNING * INTO v_usuario;
  
  -- Log XP transaction
  INSERT INTO public.xp_historico (user_id, quantidade, tipo, descricao, referencia_id)
  VALUES (p_user_id, p_quantidade, p_tipo, p_descricao, p_referencia_id);
  
  RETURN v_usuario;
END;
$$;

-- Function to do daily check-in for streaks
CREATE OR REPLACE FUNCTION public.registrar_checkin_diario(p_user_id uuid)
RETURNS public.streaks_usuarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak public.streaks_usuarios;
  v_hoje date := CURRENT_DATE;
  v_ontem date := CURRENT_DATE - 1;
  v_novo_streak integer;
  v_xp_bonus integer;
BEGIN
  -- Get or create streak record
  INSERT INTO public.streaks_usuarios (user_id, ultimo_checkin, streak_atual)
  VALUES (p_user_id, v_hoje, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_streak FROM public.streaks_usuarios WHERE user_id = p_user_id;
  
  -- If already checked in today, return current streak
  IF v_streak.ultimo_checkin = v_hoje THEN
    RETURN v_streak;
  END IF;
  
  -- Calculate new streak
  IF v_streak.ultimo_checkin = v_ontem THEN
    v_novo_streak := v_streak.streak_atual + 1;
  ELSE
    v_novo_streak := 1; -- Reset streak if missed a day
  END IF;
  
  -- Calculate XP bonus based on streak
  v_xp_bonus := CASE
    WHEN v_novo_streak >= 30 THEN 100
    WHEN v_novo_streak >= 14 THEN 50
    WHEN v_novo_streak >= 7 THEN 25
    WHEN v_novo_streak >= 3 THEN 10
    ELSE 5
  END;
  
  -- Update streak
  UPDATE public.streaks_usuarios
  SET streak_atual = v_novo_streak,
      streak_recorde = GREATEST(streak_recorde, v_novo_streak),
      ultimo_checkin = v_hoje
  WHERE user_id = p_user_id
  RETURNING * INTO v_streak;
  
  -- Record in history
  INSERT INTO public.streaks_historico (user_id, data, xp_ganho)
  VALUES (p_user_id, v_hoje, v_xp_bonus)
  ON CONFLICT (user_id, data) DO NOTHING;
  
  -- Add XP bonus
  PERFORM public.adicionar_xp(p_user_id, v_xp_bonus, 'streak', 'Bônus de streak dia ' || v_novo_streak);
  
  RETURN v_streak;
END;
$$;

-- Insert default achievement definitions
INSERT INTO public.conquistas_definicoes (codigo, nome, descricao, icone, raridade, categoria, pontos, meta, criterio) VALUES
-- Produtividade
('primeiro_item', 'Primeiro Passo', 'Complete sua primeira triagem', 'Award', 'comum', 'produtividade', 10, 1, 'triagens_total'),
('triador_iniciante', 'Triador Iniciante', 'Complete 50 triagens', 'Target', 'comum', 'produtividade', 25, 50, 'triagens_total'),
('triador_experiente', 'Triador Experiente', 'Complete 500 triagens', 'Zap', 'raro', 'produtividade', 100, 500, 'triagens_total'),
('triador_mestre', 'Mestre da Triagem', 'Complete 2000 triagens', 'Crown', 'epico', 'produtividade', 250, 2000, 'triagens_total'),
('velocista', 'Velocista', 'Complete 30 triagens em um dia', 'Timer', 'raro', 'produtividade', 75, 30, 'triagens_dia'),
('maratonista', 'Maratonista', 'Complete 100 triagens em um dia', 'Flame', 'epico', 'produtividade', 200, 100, 'triagens_dia'),
-- Qualidade
('detector_defeitos', 'Olho de Águia', 'Encontre 100 defeitos', 'Eye', 'comum', 'qualidade', 50, 100, 'defeitos_encontrados'),
('perfeccionista', 'Perfeccionista', 'Mantenha 98% de acurácia por uma semana', 'Shield', 'raro', 'qualidade', 100, 98, 'acuracia_semana'),
('zero_erros', 'Precisão Absoluta', 'Complete 50 triagens sem erros', 'CheckCircle', 'epico', 'qualidade', 150, 50, 'triagens_sem_erro'),
-- Consistência
('streak_3', 'Começando Bem', 'Mantenha streak de 3 dias', 'Flame', 'comum', 'consistencia', 15, 3, 'streak'),
('streak_7', 'Uma Semana Forte', 'Mantenha streak de 7 dias', 'Calendar', 'comum', 'consistencia', 35, 7, 'streak'),
('streak_14', 'Duas Semanas', 'Mantenha streak de 14 dias', 'CalendarCheck', 'raro', 'consistencia', 75, 14, 'streak'),
('streak_30', 'Mês Completo', 'Mantenha streak de 30 dias', 'Star', 'epico', 'consistencia', 200, 30, 'streak'),
('streak_100', 'Lenda da Consistência', 'Mantenha streak de 100 dias', 'Trophy', 'lendario', 'consistencia', 500, 100, 'streak'),
-- Especial
('primeiro_lugar', 'Número Um', 'Fique em 1º lugar no ranking semanal', 'Medal', 'epico', 'especial', 300, 1, 'ranking_semanal'),
('top_3', 'Pódio', 'Fique no top 3 do ranking semanal', 'Award', 'raro', 'especial', 150, 3, 'ranking_semanal'),
('colaborador', 'Espírito de Equipe', 'Ajude 10 colegas', 'Users', 'raro', 'especial', 100, 10, 'ajudas');

-- Insert sample daily challenges for today
INSERT INTO public.desafios_diarios (titulo, descricao, tipo, meta, xp_recompensa, dificuldade, data_ativo) VALUES
('Aquecimento', 'Complete 10 triagens hoje', 'triagens', 10, 30, 'facil', CURRENT_DATE),
('Produtividade', 'Complete 25 triagens hoje', 'triagens', 25, 75, 'normal', CURRENT_DATE),
('Detector de Qualidade', 'Encontre 5 defeitos', 'defeitos', 5, 50, 'normal', CURRENT_DATE),
('Velocidade Máxima', 'Complete 50 triagens hoje', 'triagens', 50, 150, 'dificil', CURRENT_DATE);
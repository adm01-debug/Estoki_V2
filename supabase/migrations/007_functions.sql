-- Functions for gamification

-- Add XP to user
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  INSERT INTO usuario_xp (user_id, xp_total, nivel, ultima_atividade)
  VALUES (p_user_id, p_xp, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET xp_total = usuario_xp.xp_total + p_xp,
      ultima_atividade = NOW(),
      updated_at = NOW()
  RETURNING xp_total INTO v_new_xp;
  
  -- Calculate new level (every 1000 XP)
  v_new_level := (v_new_xp / 1000) + 1;
  
  UPDATE usuario_xp SET nivel = v_new_level WHERE user_id = p_user_id;
  
  RETURN v_new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
  v_streak INTEGER;
BEGIN
  SELECT ultima_atividade::DATE, streak_atual INTO v_last_activity, v_streak
  FROM usuario_xp WHERE user_id = p_user_id;
  
  IF v_last_activity = v_today - 1 THEN
    v_streak := v_streak + 1;
  ELSIF v_last_activity < v_today - 1 THEN
    v_streak := 1;
  END IF;
  
  UPDATE usuario_xp 
  SET streak_atual = v_streak,
      maior_streak = GREATEST(maior_streak, v_streak),
      ultima_atividade = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

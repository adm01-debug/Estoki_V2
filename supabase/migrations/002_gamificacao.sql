-- Gamification tables

-- User XP and Level
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  xp_total INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  streak_atual INTEGER DEFAULT 0,
  maior_streak INTEGER DEFAULT 0,
  ultima_atividade DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements/Conquistas
CREATE TABLE IF NOT EXISTS conquistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  xp_recompensa INTEGER DEFAULT 0,
  criterio VARCHAR(50) NOT NULL,
  meta INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_conquistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  conquista_id UUID NOT NULL REFERENCES conquistas(id),
  desbloqueada_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conquista_id)
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS desafios_diarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  meta INTEGER NOT NULL,
  progresso INTEGER DEFAULT 0,
  xp_recompensa INTEGER DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  concluido BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, tipo, data)
);

-- RLS
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE desafios_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp" ON user_xp FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public conquistas" ON conquistas FOR SELECT TO authenticated USING (true);

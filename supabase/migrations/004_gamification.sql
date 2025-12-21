-- Gamification tables
CREATE TABLE IF NOT EXISTS conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  xp_recompensa INTEGER DEFAULT 0,
  criterio TEXT NOT NULL,
  meta INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuario_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  conquista_id UUID REFERENCES conquistas(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conquista_id)
);

CREATE TABLE IF NOT EXISTS desafios_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta INTEGER NOT NULL,
  xp_recompensa INTEGER DEFAULT 0,
  data DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuario_xp (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  xp_total INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  streak_atual INTEGER DEFAULT 0,
  maior_streak INTEGER DEFAULT 0,
  ultima_atividade TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuario_xp_nivel ON usuario_xp(nivel DESC);
CREATE INDEX idx_usuario_xp_total ON usuario_xp(xp_total DESC);

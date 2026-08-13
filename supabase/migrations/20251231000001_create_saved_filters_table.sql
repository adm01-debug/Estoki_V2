-- =============================================
-- Migration: Create saved_filters table
-- Description: Sistema de filtros salvos por usuário
-- Date: 2024-12-31
-- =============================================

-- Tabela para salvar filtros por usuário
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  description TEXT,
  icon TEXT DEFAULT 'filter',
  color TEXT DEFAULT 'blue',
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_filter_name_per_user_entity UNIQUE (user_id, entity_type, name)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_entity ON saved_filters(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_default ON saved_filters(user_id, entity_type, is_default) WHERE is_default = true;

-- RLS (Row Level Security)
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own filters"
ON saved_filters FOR SELECT
USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Users can insert own filters"
ON saved_filters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own filters"
ON saved_filters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own filters"
ON saved_filters FOR DELETE
USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_saved_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS saved_filters_updated_at ON saved_filters;
CREATE TRIGGER saved_filters_updated_at
  BEFORE UPDATE ON saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_filters_updated_at();

-- Função para incrementar usage_count
CREATE OR REPLACE FUNCTION increment_filter_usage(filter_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_filters
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = filter_id;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE saved_filters IS 'Filtros salvos pelos usuários para reutilização';
COMMENT ON COLUMN saved_filters.entity_type IS 'Tipo da entidade: produtos, pedidos, posicoes, etc';
COMMENT ON COLUMN saved_filters.filters IS 'JSON com os filtros aplicados';
COMMENT ON COLUMN saved_filters.is_default IS 'Se é o filtro padrão para esta entidade';
COMMENT ON COLUMN saved_filters.is_shared IS 'Se o filtro é compartilhado com outros usuários';


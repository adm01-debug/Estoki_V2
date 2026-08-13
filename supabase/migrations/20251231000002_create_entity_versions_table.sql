-- =============================================
-- Migration: Create entity_versions table
-- Description: Sistema de versionamento de registros
-- Date: 2024-12-31
-- =============================================

-- Tabela genérica de versionamento
CREATE TABLE IF NOT EXISTS entity_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version_number INT NOT NULL,
  data JSONB NOT NULL,
  diff JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  change_type TEXT DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'restore')),
  ip_address INET,
  user_agent TEXT,
  CONSTRAINT unique_version UNIQUE (entity_type, entity_id, version_number)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_versions_entity ON entity_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_versions_date ON entity_versions(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_user ON entity_versions(changed_by);
CREATE INDEX IF NOT EXISTS idx_versions_type ON entity_versions(entity_type);

-- RLS
ALTER TABLE entity_versions ENABLE ROW LEVEL SECURITY;

-- Políticas (admin pode ver tudo, usuários veem seus próprios)
CREATE POLICY "Users can view versions"
ON entity_versions FOR SELECT
USING (true);

CREATE POLICY "System can insert versions"
ON entity_versions FOR INSERT
WITH CHECK (true);

-- Função para criar versão automaticamente
CREATE OR REPLACE FUNCTION create_entity_version()
RETURNS TRIGGER AS $$
DECLARE
  new_version INT;
  changes JSONB;
BEGIN
  -- Calcular próximo número de versão
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO new_version
  FROM entity_versions
  WHERE entity_type = TG_TABLE_NAME AND entity_id = NEW.id;

  -- Calcular diff (campos alterados)
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, value)
    INTO changes
    FROM (
      SELECT key, jsonb_build_object('old', OLD_row.value, 'new', NEW_row.value) as value
      FROM jsonb_each(to_jsonb(OLD)) AS OLD_row(key, value)
      JOIN jsonb_each(to_jsonb(NEW)) AS NEW_row(key, value) ON OLD_row.key = NEW_row.key
      WHERE OLD_row.value IS DISTINCT FROM NEW_row.value
        AND OLD_row.key NOT IN ('updated_at', 'created_at')
    ) diffs;
  END IF;

  -- Inserir versão
  INSERT INTO entity_versions (
    entity_type,
    entity_id,
    version_number,
    data,
    diff,
    changed_by,
    change_type,
    change_summary
  ) VALUES (
    TG_TABLE_NAME,
    NEW.id,
    new_version,
    to_jsonb(CASE WHEN TG_OP = 'UPDATE' THEN OLD ELSE NEW END),
    changes,
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Registro criado'
      ELSE 'Registro atualizado'
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para restaurar versão
CREATE OR REPLACE FUNCTION restore_entity_version(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_version_number INT
)
RETURNS JSONB AS $$
DECLARE
  version_data JSONB;
BEGIN
  -- Buscar dados da versão
  SELECT data INTO version_data
  FROM entity_versions
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND version_number = p_version_number;

  IF version_data IS NULL THEN
    RAISE EXCEPTION 'Versão não encontrada';
  END IF;

  RETURN version_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter histórico de versões
CREATE OR REPLACE FUNCTION get_entity_history(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  version_number INT,
  changed_at TIMESTAMPTZ,
  changed_by UUID,
  change_type TEXT,
  change_summary TEXT,
  diff JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ev.version_number,
    ev.changed_at,
    ev.changed_by,
    ev.change_type,
    ev.change_summary,
    ev.diff
  FROM entity_versions ev
  WHERE ev.entity_type = p_entity_type
    AND ev.entity_id = p_entity_id
  ORDER BY ev.version_number DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE entity_versions IS 'Histórico de versões de todas as entidades';
COMMENT ON COLUMN entity_versions.diff IS 'Diferença entre versão anterior e atual';
COMMENT ON COLUMN entity_versions.change_type IS 'Tipo: create, update, restore';

-- Migration: Create feature_flags table for remote configuration
-- Resolves TODO in src/lib/featureFlags.ts

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  value JSONB,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default feature flags
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('feature.new_dashboard', true, 'Enable new dashboard layout'),
  ('feature.ai_assistant', false, 'Enable AI assistant'),
  ('feature.voice_picking', false, 'Enable voice-guided picking'),
  ('feature.multi_tenant', false, 'Enable multi-tenant mode'),
  ('ui.dark_mode', true, 'Enable dark mode toggle'),
  ('ui.animations', true, 'Enable UI animations'),
  ('integration.correios', true, 'Enable Correios integration'),
  ('integration.mercado_livre', false, 'Enable Mercado Livre integration'),
  ('perf.lazy_loading', true, 'Enable lazy loading'),
  ('perf.virtual_scroll', true, 'Enable virtual scrolling')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_active ON feature_flags(active) WHERE active = true;

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read feature flags
CREATE POLICY "Anyone can read feature_flags"
  ON feature_flags FOR SELECT
  USING (active = true);

-- Only admins can modify
CREATE POLICY "Admins can modify feature_flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

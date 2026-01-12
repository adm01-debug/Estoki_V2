-- Migration: Create import logs
-- Version: 20240119_import_logs

CREATE TABLE IF NOT EXISTS import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    filename VARCHAR(255),
    total_records INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_details JSONB DEFAULT '[]',
    options JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    imported_by UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_import_logs_type ON import_logs(type);
CREATE INDEX idx_import_logs_status ON import_logs(status);
CREATE INDEX idx_import_logs_user ON import_logs(imported_by);

-- RLS
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all import logs" ON import_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Users can view own imports" ON import_logs
    FOR SELECT USING (imported_by = auth.uid());

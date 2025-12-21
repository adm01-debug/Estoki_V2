-- Performance indexes

-- Posicoes indexes
CREATE INDEX IF NOT EXISTS idx_posicoes_status ON posicoes(status);
CREATE INDEX IF NOT EXISTS idx_posicoes_corredor ON posicoes(corredor);
CREATE INDEX IF NOT EXISTS idx_posicoes_tipo ON posicoes(tipo);

-- Triagens indexes
CREATE INDEX IF NOT EXISTS idx_triagens_status ON triagens(status);
CREATE INDEX IF NOT EXISTS idx_triagens_operador ON triagens(operador_id);
CREATE INDEX IF NOT EXISTS idx_triagens_created ON triagens(created_at DESC);

-- Recebimentos indexes
CREATE INDEX IF NOT EXISTS idx_recebimentos_status ON recebimentos(status);
CREATE INDEX IF NOT EXISTS idx_recebimentos_nf ON recebimentos(nf_numero);
CREATE INDEX IF NOT EXISTS idx_recebimentos_created ON recebimentos(created_at DESC);

-- Movimentacoes indexes
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created ON movimentacoes(created_at DESC);

-- Full text search
CREATE INDEX IF NOT EXISTS idx_posicoes_codigo_gin ON posicoes USING gin(to_tsvector('portuguese', codigo));

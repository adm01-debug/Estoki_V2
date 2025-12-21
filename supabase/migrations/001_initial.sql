-- Initial database schema for ESTOKI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posicoes table
CREATE TABLE IF NOT EXISTS posicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  corredor VARCHAR(10) NOT NULL,
  prateleira VARCHAR(10) NOT NULL,
  nivel VARCHAR(10) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'picking',
  status VARCHAR(20) NOT NULL DEFAULT 'livre',
  capacidade_max INTEGER DEFAULT 100,
  ocupacao_atual INTEGER DEFAULT 0,
  produto_id UUID,
  lote_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triagens table
CREATE TABLE IF NOT EXISTS triagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID NOT NULL,
  operador_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  quantidade_total INTEGER NOT NULL,
  quantidade_aprovada INTEGER DEFAULT 0,
  quantidade_reprovada INTEGER DEFAULT 0,
  observacoes TEXT,
  fotos TEXT[],
  inicio TIMESTAMPTZ DEFAULT NOW(),
  fim TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recebimentos table
CREATE TABLE IF NOT EXISTS recebimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nf_numero VARCHAR(50) NOT NULL,
  fornecedor_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  data_prevista DATE,
  data_recebimento TIMESTAMPTZ,
  conferente_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE posicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE triagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow read for authenticated" ON posicoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON triagens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON recebimentos FOR SELECT TO authenticated USING (true);

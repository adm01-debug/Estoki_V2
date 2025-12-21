-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE posicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE triagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policies for posicoes
CREATE POLICY "Users can view all positions" ON posicoes FOR SELECT USING (true);
CREATE POLICY "Users can update positions" ON posicoes FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for triagens
CREATE POLICY "Users can view all triagens" ON triagens FOR SELECT USING (true);
CREATE POLICY "Users can create triagens" ON triagens FOR INSERT WITH CHECK (auth.uid() = operador_id);
CREATE POLICY "Users can update own triagens" ON triagens FOR UPDATE USING (auth.uid() = operador_id);

-- Policies for recebimentos
CREATE POLICY "Users can view all recebimentos" ON recebimentos FOR SELECT USING (true);
CREATE POLICY "Users can create recebimentos" ON recebimentos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update recebimentos" ON recebimentos FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for movimentacoes
CREATE POLICY "Users can view all movimentacoes" ON movimentacoes FOR SELECT USING (true);
CREATE POLICY "Users can create movimentacoes" ON movimentacoes FOR INSERT WITH CHECK (auth.uid() = operador_id);

-- Policies for usuarios
CREATE POLICY "Users can view all users" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON usuarios FOR UPDATE USING (auth.uid()::text = id);

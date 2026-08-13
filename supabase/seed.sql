-- ESTOKI WMS - Database Seed Script
-- Este script popula o banco com dados iniciais para produção

-- 1. Categorias de Produtos
INSERT INTO categories (id, name, code, description, parent_id, is_active) VALUES
  (gen_random_uuid(), 'Brindes Promocionais', 'BRINDES', 'Produtos para brindes corporativos', NULL, true),
  (gen_random_uuid(), 'Eletrônicos', 'ELETRO', 'Dispositivos eletrônicos', NULL, true),
  (gen_random_uuid(), 'Escritório', 'ESCRIT', 'Material de escritório', NULL, true),
  (gen_random_uuid(), 'Têxteis', 'TEXTIL', 'Camisetas, bonés, bolsas', NULL, true),
  (gen_random_uuid(), 'Embalagens', 'EMBAL', 'Caixas e embalagens', NULL, true)
ON CONFLICT (code) DO NOTHING;

-- 2. Localizações de Armazém
INSERT INTO locations (id, code, name, zone, aisle, rack, level, position, type, capacity, is_active) VALUES
  (gen_random_uuid(), 'REC-01', 'Recebimento 01', 'RECEBIMENTO', 'A', '01', '01', '01', 'receiving', 1000, true),
  (gen_random_uuid(), 'REC-02', 'Recebimento 02', 'RECEBIMENTO', 'A', '01', '01', '02', 'receiving', 1000, true),
  (gen_random_uuid(), 'ARM-A-01-01', 'Estante A-01-01', 'ARMAZENAGEM', 'A', '01', '01', '01', 'storage', 100, true),
  (gen_random_uuid(), 'ARM-A-01-02', 'Estante A-01-02', 'ARMAZENAGEM', 'A', '01', '01', '02', 'storage', 100, true),
  (gen_random_uuid(), 'ARM-A-02-01', 'Estante A-02-01', 'ARMAZENAGEM', 'A', '02', '01', '01', 'storage', 100, true),
  (gen_random_uuid(), 'ARM-B-01-01', 'Estante B-01-01', 'ARMAZENAGEM', 'B', '01', '01', '01', 'storage', 150, true),
  (gen_random_uuid(), 'ARM-B-01-02', 'Estante B-01-02', 'ARMAZENAGEM', 'B', '01', '01', '02', 'storage', 150, true),
  (gen_random_uuid(), 'EXP-01', 'Expedição 01', 'EXPEDICAO', 'E', '01', '01', '01', 'shipping', 500, true),
  (gen_random_uuid(), 'EXP-02', 'Expedição 02', 'EXPEDICAO', 'E', '01', '01', '02', 'shipping', 500, true),
  (gen_random_uuid(), 'TRI-01', 'Triagem 01', 'TRIAGEM', 'T', '01', '01', '01', 'staging', 200, true)
ON CONFLICT (code) DO NOTHING;

-- 3. Unidades de Medida
INSERT INTO units_of_measure (id, code, name, symbol, base_unit, conversion_factor) VALUES
  (gen_random_uuid(), 'UN', 'Unidade', 'un', 'UN', 1),
  (gen_random_uuid(), 'CX', 'Caixa', 'cx', 'UN', 12),
  (gen_random_uuid(), 'PC', 'Pacote', 'pct', 'UN', 10),
  (gen_random_uuid(), 'KG', 'Quilograma', 'kg', 'KG', 1),
  (gen_random_uuid(), 'MT', 'Metro', 'm', 'MT', 1),
  (gen_random_uuid(), 'LT', 'Litro', 'L', 'LT', 1)
ON CONFLICT (code) DO NOTHING;

-- 4. Status de Pedidos
INSERT INTO order_statuses (id, code, name, description, color, sequence, is_final) VALUES
  (gen_random_uuid(), 'PENDING', 'Pendente', 'Aguardando processamento', '#f59e0b', 1, false),
  (gen_random_uuid(), 'PROCESSING', 'Em Processamento', 'Sendo processado', '#3b82f6', 2, false),
  (gen_random_uuid(), 'PICKING', 'Em Separação', 'Itens sendo separados', '#8b5cf6', 3, false),
  (gen_random_uuid(), 'PACKED', 'Embalado', 'Pronto para expedição', '#06b6d4', 4, false),
  (gen_random_uuid(), 'SHIPPED', 'Expedido', 'Enviado para entrega', '#10b981', 5, false),
  (gen_random_uuid(), 'DELIVERED', 'Entregue', 'Entregue ao cliente', '#22c55e', 6, true),
  (gen_random_uuid(), 'CANCELLED', 'Cancelado', 'Pedido cancelado', '#ef4444', 99, true)
ON CONFLICT (code) DO NOTHING;

-- 5. Transportadoras
INSERT INTO carriers (id, code, name, cnpj, phone, email, tracking_url, is_active) VALUES
  (gen_random_uuid(), 'CORREIOS', 'Correios', '34028316000103', '0800-725-7282', 'faleconosco@correios.com.br', 'https://rastreamento.correios.com.br/app/index.php?objetos={tracking}', true),
  (gen_random_uuid(), 'JADLOG', 'Jadlog', '04884082000135', '0800-725-3569', 'contato@jadlog.com.br', 'https://www.jadlog.com.br/tracking?code={tracking}', true),
  (gen_random_uuid(), 'LALAMOVE', 'Lalamove', '27439165000171', '11-4003-5567', 'suporte@lalamove.com', 'https://lalamove.com/tracking/{tracking}', true),
  (gen_random_uuid(), 'LOGGI', 'Loggi', '18188681000170', '11-3003-5444', 'contato@loggi.com', 'https://loggi.com/tracking/{tracking}', true),
  (gen_random_uuid(), 'PROPRIO', 'Veículo Próprio', NULL, NULL, NULL, NULL, true)
ON CONFLICT (code) DO NOTHING;

-- 6. Fornecedores
INSERT INTO suppliers (id, code, name, cnpj, phone, email, address, city, state, is_active) VALUES
  (gen_random_uuid(), 'XBZ', 'XBZ Brindes', '12345678000199', '11-99999-9999', 'contato@xbz.com.br', 'Rua dos Brindes, 100', 'São Paulo', 'SP', true),
  (gen_random_uuid(), 'ASIA', 'Asia Import', '98765432000188', '11-88888-8888', 'vendas@asiaimport.com.br', 'Av. Importadora, 500', 'São Paulo', 'SP', true),
  (gen_random_uuid(), 'SOMARCAS', 'Só Marcas', '11111111000111', '11-77777-7777', 'comercial@somarcas.com.br', 'Rua das Marcas, 200', 'Guarulhos', 'SP', true)
ON CONFLICT (code) DO NOTHING;

-- 7. Configurações do Sistema
INSERT INTO system_settings (key, value, description, type) VALUES
  ('company_name', '"Promo Brindes"', 'Nome da empresa', 'string'),
  ('company_cnpj', '"12345678000190"', 'CNPJ da empresa', 'string'),
  ('default_warehouse', '"MATRIZ"', 'Armazém padrão', 'string'),
  ('stock_alert_threshold', '10', 'Limite para alerta de estoque baixo', 'number'),
  ('auto_generate_lots', 'true', 'Gerar lotes automaticamente no recebimento', 'boolean'),
  ('require_lot_on_pick', 'true', 'Exigir lote na separação', 'boolean'),
  ('fifo_enabled', 'true', 'Usar FIFO para expedição', 'boolean'),
  ('gamification_enabled', 'true', 'Habilitar gamificação', 'boolean'),
  ('points_per_receipt', '10', 'Pontos por recebimento concluído', 'number'),
  ('points_per_pick', '5', 'Pontos por separação concluída', 'number'),
  ('barcode_format', '"EAN13"', 'Formato padrão de código de barras', 'string')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8. Criar usuário admin padrão (se não existir)
-- Nota: O usuário real deve ser criado via Auth do Supabase
INSERT INTO profiles (id, email, full_name, role, department, is_active)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'admin@promobrindes.com.br',
  'Administrador',
  'admin',
  'TI',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'admin@promobrindes.com.br'
);

-- 9. Criar tabela de health check
CREATE TABLE IF NOT EXISTS _health (
  id SERIAL PRIMARY KEY,
  checked_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO _health DEFAULT VALUES;

-- 10. Log de seed
INSERT INTO activity_logs (action, entity_type, entity_id, changes, created_by)
VALUES (
  'SEED_DATABASE',
  'system',
  'seed_script',
  '{"version": "1.0", "executed_at": "' || NOW() || '"}',
  '00000000-0000-0000-0000-000000000001'
);

-- Fim do seed
SELECT 'Database seeded successfully!' as status;

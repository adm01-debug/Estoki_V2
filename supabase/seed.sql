-- Seed data for development

-- Sample positions
INSERT INTO posicoes (codigo, corredor, prateleira, nivel, tipo, status) VALUES
('A01-01-1', 'A', '01', '1', 'picking', 'ocupada'),
('A01-01-2', 'A', '01', '2', 'pulmao', 'livre'),
('A01-02-1', 'A', '02', '1', 'picking', 'ocupada'),
('B01-01-1', 'B', '01', '1', 'blocado', 'livre'),
('B01-01-2', 'B', '01', '2', 'picking', 'reservada');

-- Sample achievements
INSERT INTO conquistas (nome, descricao, icone, xp_recompensa, criterio, meta) VALUES
('Primeiro Passo', 'Complete sua primeira triagem', 'star', 100, 'triagens', 1),
('Veterano', 'Complete 100 triagens', 'trophy', 500, 'triagens', 100),
('Perfeccionista', 'Mantenha 95% de aprovação por 7 dias', 'target', 300, 'aprovacao', 95),
('Maratonista', 'Mantenha streak de 30 dias', 'flame', 1000, 'streak', 30);

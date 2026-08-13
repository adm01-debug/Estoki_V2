-- Create permissions table
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'geral',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted boolean NOT NULL DEFAULT true,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (role, permission_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Permissions policies (anyone can view, only admins can manage)
CREATE POLICY "Anyone can view permissions" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Role permissions policies
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default permissions
INSERT INTO public.permissions (code, name, description, category) VALUES
  -- Estoque
  ('estoque.view', 'Visualizar Estoque', 'Permite visualizar posições e produtos em estoque', 'Estoque'),
  ('estoque.edit', 'Editar Estoque', 'Permite editar informações de estoque', 'Estoque'),
  ('estoque.transfer', 'Transferir Estoque', 'Permite realizar transferências entre posições', 'Estoque'),
  ('estoque.adjust', 'Ajustar Estoque', 'Permite realizar ajustes de inventário', 'Estoque'),
  
  -- Recebimento
  ('recebimento.view', 'Visualizar Recebimentos', 'Permite visualizar recebimentos', 'Recebimento'),
  ('recebimento.create', 'Criar Recebimentos', 'Permite registrar novos recebimentos', 'Recebimento'),
  ('recebimento.conferir', 'Conferir Recebimentos', 'Permite realizar conferência de recebimentos', 'Recebimento'),
  
  -- Triagem
  ('triagem.view', 'Visualizar Triagens', 'Permite visualizar triagens', 'Triagem'),
  ('triagem.execute', 'Executar Triagem', 'Permite realizar triagens de produtos', 'Triagem'),
  ('triagem.approve', 'Aprovar/Reprovar', 'Permite aprovar ou reprovar itens na triagem', 'Triagem'),
  
  -- Tarefas
  ('tarefas.view', 'Visualizar Tarefas', 'Permite visualizar tarefas', 'Tarefas'),
  ('tarefas.create', 'Criar Tarefas', 'Permite criar novas tarefas', 'Tarefas'),
  ('tarefas.assign', 'Atribuir Tarefas', 'Permite atribuir tarefas a operadores', 'Tarefas'),
  ('tarefas.execute', 'Executar Tarefas', 'Permite executar tarefas atribuídas', 'Tarefas'),
  
  -- Expedição
  ('expedicao.view', 'Visualizar Expedição', 'Permite visualizar romaneios e entregas', 'Expedição'),
  ('expedicao.create', 'Criar Romaneios', 'Permite criar romaneios de entrega', 'Expedição'),
  ('expedicao.manage', 'Gerenciar Expedição', 'Permite gerenciar processo de expedição', 'Expedição'),
  
  -- Relatórios
  ('relatorios.view', 'Visualizar Relatórios', 'Permite visualizar relatórios básicos', 'Relatórios'),
  ('relatorios.export', 'Exportar Relatórios', 'Permite exportar relatórios em PDF/Excel', 'Relatórios'),
  ('relatorios.kpis', 'Acessar KPIs', 'Permite acessar indicadores operacionais', 'Relatórios'),
  
  -- Configurações
  ('config.view', 'Visualizar Configurações', 'Permite visualizar configurações do sistema', 'Configurações'),
  ('config.edit', 'Editar Configurações', 'Permite editar configurações do sistema', 'Configurações'),
  ('config.users', 'Gerenciar Usuários', 'Permite gerenciar usuários e roles', 'Configurações'),
  ('config.security', 'Configurações de Segurança', 'Permite gerenciar configurações de segurança', 'Configurações'),
  
  -- Alertas
  ('alertas.view', 'Visualizar Alertas', 'Permite visualizar alertas do sistema', 'Alertas'),
  ('alertas.manage', 'Gerenciar Alertas', 'Permite configurar e gerenciar alertas', 'Alertas'),
  ('alertas.resolve', 'Resolver Alertas', 'Permite marcar alertas como resolvidos', 'Alertas');

-- Set default permissions for each role
-- Admin gets all permissions
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'admin', id, true FROM public.permissions;

-- Supervisor gets most permissions except config
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'supervisor', id, true FROM public.permissions 
WHERE code NOT IN ('config.users', 'config.security');

-- Operador gets basic operational permissions
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'operador', id, true FROM public.permissions 
WHERE code IN (
  'estoque.view', 'estoque.transfer',
  'recebimento.view', 'recebimento.conferir',
  'triagem.view', 'triagem.execute',
  'tarefas.view', 'tarefas.execute',
  'expedicao.view',
  'relatorios.view',
  'alertas.view'
);

-- Create index for faster lookups
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX idx_permissions_category ON public.permissions(category);
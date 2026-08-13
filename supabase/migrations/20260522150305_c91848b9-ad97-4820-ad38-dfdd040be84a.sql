-- Função helper para verificar se o usuário é admin ou supervisor de forma eficiente
CREATE OR REPLACE FUNCTION public.has_role_v2(user_id uuid, required_role public.app_role)
RETURNS boolean AS $$
DECLARE
  user_role public.app_role;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  
  IF required_role = 'admin' THEN
    RETURN user_role = 'admin';
  ELSIF required_role = 'supervisor' THEN
    RETURN user_role IN ('admin', 'supervisor');
  ELSIF required_role = 'operador' THEN
    RETURN user_role IN ('admin', 'supervisor', 'operador');
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auditoria: Apenas admins podem ver todos os logs
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all" ON public.audit_log;
CREATE POLICY "Audit Log: Apenas Admins" 
ON public.audit_log FOR SELECT 
USING (has_role_v2(auth.uid(), 'admin'));

-- NFe Documents: Supervisor e Admin
ALTER TABLE public.nfe_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin access nfe_documents" ON public.nfe_documents;
CREATE POLICY "NFe: Supervisor e Admin" 
ON public.nfe_documents FOR ALL 
USING (has_role_v2(auth.uid(), 'supervisor'));

-- Alertas Config: Admin apenas
ALTER TABLE public.alertas_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage alerts config" ON public.alertas_config;
CREATE POLICY "Alertas Config: Admin apenas" 
ON public.alertas_config FOR ALL 
USING (has_role_v2(auth.uid(), 'admin'));

-- Inventário Ciclos: Supervisor e Admin
ALTER TABLE public.inventario_ciclos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and supervisors can manage inventory cycles" ON public.inventario_ciclos;
CREATE POLICY "Inventário Ciclos: Supervisor e Admin" 
ON public.inventario_ciclos FOR ALL 
USING (has_role_v2(auth.uid(), 'supervisor'));

-- Produtos: Leitura para todos, Escrita para Supervisor
DROP POLICY IF EXISTS "Produtos: Leitura para todos autenticados" ON public.produtos;
CREATE POLICY "Produtos: Leitura para todos autenticados" 
ON public.produtos FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Produtos: Escrita para Supervisores" ON public.produtos;
CREATE POLICY "Produtos: Escrita para Supervisores" 
ON public.produtos FOR ALL 
USING (has_role_v2(auth.uid(), 'supervisor'));

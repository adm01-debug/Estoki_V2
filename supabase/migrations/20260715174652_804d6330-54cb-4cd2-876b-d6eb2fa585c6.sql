-- ajustes_estoque
ALTER POLICY "Ajustes são visíveis para admins e supervisores" ON public.ajustes_estoque TO authenticated;
ALTER POLICY "Qualquer operador autenticado pode criar pedido de ajuste" ON public.ajustes_estoque TO authenticated;

-- gamificacao_transacoes
ALTER POLICY "Usuários podem comprar itens" ON public.gamificacao_transacoes TO authenticated;
ALTER POLICY "Usuários veem suas próprias transações" ON public.gamificacao_transacoes TO authenticated;

-- lotes
ALTER POLICY "Admins and supervisors can insert lots" ON public.lotes TO authenticated;
ALTER POLICY "Admins and supervisors can update lots" ON public.lotes TO authenticated;

-- orders
ALTER POLICY "Gestão para supervisores e admins" ON public.orders TO authenticated;

-- produtos
ALTER POLICY "Admins and supervisors can insert products" ON public.produtos TO authenticated;
ALTER POLICY "Admins and supervisors can update products" ON public.produtos TO authenticated;
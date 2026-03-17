
-- Fix: Restrict aprovacoes_movimentacao SELECT to involved parties and privileged roles
DROP POLICY IF EXISTS "Authenticated users can view approvals" ON public.aprovacoes_movimentacao;
DROP POLICY IF EXISTS "Authenticated users can view movement approvals" ON public.aprovacoes_movimentacao;

-- Find and drop any permissive SELECT policy with USING(true)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'aprovacoes_movimentacao'
      AND schemaname = 'public'
      AND cmd = 'SELECT'
      AND qual = 'true'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.aprovacoes_movimentacao', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view relevant approvals"
ON public.aprovacoes_movimentacao
FOR SELECT
TO authenticated
USING (
  solicitante_id = auth.uid()
  OR aprovador_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'supervisor'::app_role)
);

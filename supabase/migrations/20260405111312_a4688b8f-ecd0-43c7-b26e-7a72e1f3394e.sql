-- Fix 1: Remove broadcast leak from notificacoes - drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notificacoes;

-- Fix 2: Add WITH CHECK to operators update policy on tarefas
DROP POLICY IF EXISTS "Operators can update own tasks" ON public.tarefas;

CREATE POLICY "Operators can update own tasks"
ON public.tarefas
FOR UPDATE
TO authenticated
USING (operador_id = auth.uid())
WITH CHECK (operador_id = auth.uid());
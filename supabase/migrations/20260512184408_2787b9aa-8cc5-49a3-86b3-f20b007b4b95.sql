-- Corrigindo search_path para segurança
ALTER FUNCTION public.aplicar_ajuste_estoque() SET search_path = public;

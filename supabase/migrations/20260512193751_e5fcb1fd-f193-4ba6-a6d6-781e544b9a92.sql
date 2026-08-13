-- Tabela para histórico de alterações de status de posições
CREATE TABLE IF NOT EXISTS public.posicao_status_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posicao_id UUID NOT NULL REFERENCES public.posicoes_estoque(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  motivo TEXT,
  operador_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.posicao_status_log ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Qualquer usuário autenticado pode ver o histórico de posições" 
ON public.posicao_status_log FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Qualquer usuário autenticado pode registrar log de posição" 
ON public.posicao_status_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para log automático de alteração de status
CREATE OR REPLACE FUNCTION public.log_posicao_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.posicao_status_log (posicao_id, status_anterior, status_novo, operador_id)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_posicao_status ON public.posicoes_estoque;
CREATE TRIGGER tr_log_posicao_status
AFTER UPDATE OF status ON public.posicoes_estoque
FOR EACH ROW EXECUTE FUNCTION public.log_posicao_status_change();

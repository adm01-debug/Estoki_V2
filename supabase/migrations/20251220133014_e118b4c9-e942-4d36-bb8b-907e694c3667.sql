-- Create table for notifications
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  referencia_tipo TEXT,
  referencia_id UUID,
  lida BOOLEAN NOT NULL DEFAULT false,
  data_leitura TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notifications"
ON public.notificacoes
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications"
ON public.notificacoes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert notifications"
ON public.notificacoes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;

-- Create function to generate notifications on lote status change
CREATE OR REPLACE FUNCTION public.trigger_notificacao_recebimento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_produto_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
  v_tipo TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get product name
    SELECT nome INTO v_produto_nome FROM public.produtos WHERE id = NEW.produto_id;
    
    -- Check for 'recebido' status
    IF NEW.status = 'recebido' THEN
      v_tipo := 'recebimento_chegou';
      v_titulo := 'Recebimento Chegou';
      v_mensagem := 'Lote ' || NEW.numero_lote || ' (' || COALESCE(v_produto_nome, 'Produto') || ') chegou e está pronto para conferência.';
      
      INSERT INTO public.notificacoes (tipo, titulo, mensagem, referencia_tipo, referencia_id)
      VALUES (v_tipo, v_titulo, v_mensagem, 'lote', NEW.id);
    END IF;
    
    -- Check for 'divergencia' status
    IF NEW.status = 'divergencia' THEN
      v_tipo := 'recebimento_divergencia';
      v_titulo := '⚠️ Divergência no Recebimento';
      v_mensagem := 'Lote ' || NEW.numero_lote || ' (' || COALESCE(v_produto_nome, 'Produto') || ') tem divergência: ' ||
                   'Pedido ' || COALESCE(NEW.quantidade_pedida::TEXT, NEW.quantidade_inicial::TEXT) || ' un, ' ||
                   'Recebido ' || NEW.quantidade_atual::TEXT || ' un.';
      
      INSERT INTO public.notificacoes (tipo, titulo, mensagem, referencia_tipo, referencia_id)
      VALUES (v_tipo, v_titulo, v_mensagem, 'lote', NEW.id);
    END IF;
    
    -- Check for 'conferido' status
    IF NEW.status = 'conferido' THEN
      v_tipo := 'recebimento_conferido';
      v_titulo := '✓ Recebimento Conferido';
      v_mensagem := 'Lote ' || NEW.numero_lote || ' (' || COALESCE(v_produto_nome, 'Produto') || ') foi conferido com sucesso.';
      
      INSERT INTO public.notificacoes (tipo, titulo, mensagem, referencia_tipo, referencia_id)
      VALUES (v_tipo, v_titulo, v_mensagem, 'lote', NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on lotes table
CREATE TRIGGER trigger_notificacao_lote_status
AFTER UPDATE ON public.lotes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notificacao_recebimento();
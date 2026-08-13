-- Tabela de Ajustes de Estoque
CREATE TABLE public.ajustes_estoque (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID REFERENCES public.produtos(id) NOT NULL,
    lote_id UUID REFERENCES public.lotes(id),
    posicao_id UUID REFERENCES public.posicoes_estoque(id),
    quantidade_anterior INTEGER NOT NULL,
    quantidade_nova INTEGER NOT NULL,
    diferenca INTEGER GENERATED ALWAYS AS (quantidade_nova - quantidade_anterior) STORED,
    motivo TEXT NOT NULL, -- 'perda', 'quebra', 'correcao', 'inventario', 'vencimento'
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado'
    operador_id UUID REFERENCES auth.users(id) NOT NULL,
    aprovado_por UUID REFERENCES auth.users(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ajustes_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Ajustes são visíveis para admins e supervisores" 
ON public.ajustes_estoque 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Qualquer operador autenticado pode criar pedido de ajuste" 
ON public.ajustes_estoque 
FOR INSERT 
WITH CHECK (auth.uid() = operador_id);

CREATE POLICY "Apenas admins e supervisores podem atualizar status de ajuste" 
ON public.ajustes_estoque 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

-- Trigger para atualizar UpdatedAt
CREATE TRIGGER update_ajustes_estoque_updated_at
BEFORE UPDATE ON public.ajustes_estoque
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para aplicar ajuste ao estoque ao aprovar
CREATE OR REPLACE FUNCTION public.aplicar_ajuste_estoque()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o status mudou para aprovado
    IF (OLD.status = 'pendente' AND NEW.status = 'aprovado') THEN
        -- Se temos um lote_id, atualizamos a quantidade do lote
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.lotes 
            SET quantidade_atual = NEW.quantidade_nova,
                updated_at = now()
            WHERE id = NEW.lote_id;
        END IF;
        
        -- Registra no log de auditoria
        INSERT INTO public.audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            entity_label,
            old_values,
            new_values
        ) VALUES (
            NEW.aprovado_por,
            'adjust',
            'estoque',
            COALESCE(NEW.lote_id::text, NEW.produto_id::text),
            'Ajuste de estoque aprovado: ' || NEW.motivo,
            jsonb_build_object('quantidade', NEW.quantidade_anterior),
            jsonb_build_object('quantidade', NEW.quantidade_nova)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_aplicar_ajuste_estoque
AFTER UPDATE ON public.ajustes_estoque
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.aplicar_ajuste_estoque();

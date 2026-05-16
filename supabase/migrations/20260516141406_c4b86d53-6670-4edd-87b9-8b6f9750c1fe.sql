-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_eventos_triagem_operador ON public.eventos_triagem (operador_id);
CREATE INDEX IF NOT EXISTS idx_eventos_triagem_lote ON public.eventos_triagem (lote_id);
CREATE INDEX IF NOT EXISTS idx_eventos_triagem_status ON public.eventos_triagem (resultado) WHERE data_fim IS NOT NULL;

-- Automated Updated At trigger for triagem
DROP TRIGGER IF EXISTS tr_eventos_triagem_updated_at ON public.eventos_triagem;
CREATE TRIGGER tr_eventos_triagem_updated_at
BEFORE UPDATE ON public.eventos_triagem
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gamification trigger: Grant XP on approved triage
CREATE OR REPLACE FUNCTION public.handle_triagem_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only if triage was just finished and approved
    IF (NEW.data_fim IS NOT NULL AND OLD.data_fim IS NULL AND NEW.resultado = 'aprovado') THEN
        -- Increase XP for the operator (assuming profiles table has xp_total)
        UPDATE public.profiles 
        SET xp_total = COALESCE(xp_total, 0) + 50
        WHERE id = NEW.operador_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_triagem_completion_xp ON public.eventos_triagem;
CREATE TRIGGER tr_triagem_completion_xp
AFTER UPDATE ON public.eventos_triagem
FOR EACH ROW EXECUTE FUNCTION public.handle_triagem_completion();

-- Restrict triage deletions
DROP POLICY IF EXISTS "Admins and supervisors can delete triage" ON public.eventos_triagem;
CREATE POLICY "Admins and supervisors can delete triage" 
ON public.eventos_triagem FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

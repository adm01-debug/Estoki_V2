-- Remove broken duplicate: handle_triagem_completion writes to profiles.xp_total (column
-- does not exist). XP is already correctly awarded by trigger_xp_triagem_completa.
DROP TRIGGER IF EXISTS tr_triagem_completion_xp ON public.eventos_triagem;
DROP FUNCTION IF EXISTS public.handle_triagem_completion();
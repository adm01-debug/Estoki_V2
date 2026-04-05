-- Remove notificacoes from Realtime publication to prevent channel subscription leak
-- Notifications should be fetched via standard queries, not broadcast via Realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.notificacoes;
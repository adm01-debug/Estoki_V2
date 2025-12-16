-- Enable realtime for KPI-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.metricas_operacionais;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posicoes_estoque;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_triagem;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_picking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tarefas;
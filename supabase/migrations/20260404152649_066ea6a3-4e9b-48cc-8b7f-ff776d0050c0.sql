-- Add version column for optimistic locking on critical tables
ALTER TABLE public.lotes ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.estoque_posicao ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.ondas_separacao ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.romaneios ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.inventario_contagens ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

-- Create function to auto-increment version on update
CREATE OR REPLACE FUNCTION public.increment_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.version := OLD.version + 1;
  RETURN NEW;
END;
$$;

-- Apply auto-increment triggers
CREATE TRIGGER trg_lotes_version BEFORE UPDATE ON public.lotes FOR EACH ROW EXECUTE FUNCTION public.increment_version();
CREATE TRIGGER trg_estoque_posicao_version BEFORE UPDATE ON public.estoque_posicao FOR EACH ROW EXECUTE FUNCTION public.increment_version();
CREATE TRIGGER trg_tarefas_version BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION public.increment_version();
CREATE TRIGGER trg_ondas_separacao_version BEFORE UPDATE ON public.ondas_separacao FOR EACH ROW EXECUTE FUNCTION public.increment_version();
CREATE TRIGGER trg_romaneios_version BEFORE UPDATE ON public.romaneios FOR EACH ROW EXECUTE FUNCTION public.increment_version();
CREATE TRIGGER trg_inventario_contagens_version BEFORE UPDATE ON public.inventario_contagens FOR EACH ROW EXECUTE FUNCTION public.increment_version();
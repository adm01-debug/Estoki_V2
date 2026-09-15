-- CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  cor text,
  icone text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_select_all" ON public.categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "categorias_insert_supervisor_admin" ON public.categorias FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))
);
CREATE POLICY "categorias_update_supervisor_admin" ON public.categorias FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))
);
CREATE POLICY "categorias_delete_admin" ON public.categorias FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ARMAZENS
CREATE TABLE IF NOT EXISTS public.armazens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  capacidade_total_kg numeric,
  capacidade_total_m3 numeric,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.armazens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "armazens_select_all" ON public.armazens FOR SELECT TO authenticated USING (true);
CREATE POLICY "armazens_insert_admin" ON public.armazens FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "armazens_update_admin" ON public.armazens FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "armazens_delete_admin" ON public.armazens FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nome text NOT NULL,
  nome_fantasia text,
  cnpj_cpf text,
  email text,
  telefone text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  contato_nome text,
  contato_telefone text,
  contato_email text,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes_select_all" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "clientes_insert_supervisor_admin" ON public.clientes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))
);
CREATE POLICY "clientes_update_supervisor_admin" ON public.clientes FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))
);
CREATE POLICY "clientes_delete_admin" ON public.clientes FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- SERIAL_NUMBERS
CREATE TABLE IF NOT EXISTS public.serial_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  lote_id uuid REFERENCES public.lotes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel','reservado','expedido','devolvido','descartado')),
  data_fabricacao date,
  data_validade date,
  nf_entrada text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "serial_numbers_select_all" ON public.serial_numbers FOR SELECT TO authenticated USING (true);
CREATE POLICY "serial_numbers_insert_operador_supervisor_admin" ON public.serial_numbers FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor','operador'))
);
CREATE POLICY "serial_numbers_update_admin_supervisor" ON public.serial_numbers FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))
);
CREATE POLICY "serial_numbers_delete_admin_supervisor" ON public.serial_numbers FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))
);

-- Triggers de updated_at
DROP TRIGGER IF EXISTS update_categorias_updated_at ON public.categorias;
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_armazens_updated_at ON public.armazens;
CREATE TRIGGER update_armazens_updated_at BEFORE UPDATE ON public.armazens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_serial_numbers_updated_at ON public.serial_numbers;
CREATE TRIGGER update_serial_numbers_updated_at BEFORE UPDATE ON public.serial_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
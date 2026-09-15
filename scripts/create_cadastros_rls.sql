DO $$
BEGIN
  -- RLS
  ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.armazens ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;

  -- Policies categorias
  DROP POLICY IF EXISTS "categorias_select_all" ON public.categorias;
  CREATE POLICY "categorias_select_all" ON public.categorias FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "categorias_insert_supervisor_admin" ON public.categorias;
  CREATE POLICY "categorias_insert_supervisor_admin" ON public.categorias FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')));
  DROP POLICY IF EXISTS "categorias_update_supervisor_admin" ON public.categorias;
  CREATE POLICY "categorias_update_supervisor_admin" ON public.categorias FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')));
  DROP POLICY IF EXISTS "categorias_delete_admin" ON public.categorias;
  CREATE POLICY "categorias_delete_admin" ON public.categorias FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

  -- Policies armazens
  DROP POLICY IF EXISTS "armazens_select_all" ON public.armazens;
  CREATE POLICY "armazens_select_all" ON public.armazens FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "armazens_insert_admin" ON public.armazens;
  CREATE POLICY "armazens_insert_admin" ON public.armazens FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  DROP POLICY IF EXISTS "armazens_update_admin" ON public.armazens;
  CREATE POLICY "armazens_update_admin" ON public.armazens FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  DROP POLICY IF EXISTS "armazens_delete_admin" ON public.armazens;
  CREATE POLICY "armazens_delete_admin" ON public.armazens FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

  -- Policies clientes
  DROP POLICY IF EXISTS "clientes_select_all" ON public.clientes;
  CREATE POLICY "clientes_select_all" ON public.clientes FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "clientes_insert_supervisor_admin" ON public.clientes;
  CREATE POLICY "clientes_insert_supervisor_admin" ON public.clientes FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')));
  DROP POLICY IF EXISTS "clientes_update_supervisor_admin" ON public.clientes;
  CREATE POLICY "clientes_update_supervisor_admin" ON public.clientes FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')));
  DROP POLICY IF EXISTS "clientes_delete_admin" ON public.clientes;
  CREATE POLICY "clientes_delete_admin" ON public.clientes FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

  -- Policies serial_numbers
  DROP POLICY IF EXISTS "serial_numbers_select_all" ON public.serial_numbers;
  CREATE POLICY "serial_numbers_select_all" ON public.serial_numbers FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "serial_numbers_insert_all" ON public.serial_numbers;
  CREATE POLICY "serial_numbers_insert_all" ON public.serial_numbers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor','operador')));
  DROP POLICY IF EXISTS "serial_numbers_update_admin_supervisor" ON public.serial_numbers;
  CREATE POLICY "serial_numbers_update_admin_supervisor" ON public.serial_numbers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')));
  DROP POLICY IF EXISTS "serial_numbers_delete_admin_supervisor" ON public.serial_numbers;
  CREATE POLICY "serial_numbers_delete_admin_supervisor" ON public.serial_numbers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')));

  -- Triggers updated_at
  DROP TRIGGER IF EXISTS update_categorias_updated_at ON public.categorias;
  CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  DROP TRIGGER IF EXISTS update_armazens_updated_at ON public.armazens;
  CREATE TRIGGER update_armazens_updated_at BEFORE UPDATE ON public.armazens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
  CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  DROP TRIGGER IF EXISTS update_serial_numbers_updated_at ON public.serial_numbers;
  CREATE TRIGGER update_serial_numbers_updated_at BEFORE UPDATE ON public.serial_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
END $$;
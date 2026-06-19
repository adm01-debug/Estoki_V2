
-- Wave 6: Restrict writes on operational tables to admin/supervisor, and tighten nfe access

-- Helper: drop & recreate policies on a set of tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['products','locations','inventory_lots','receivings','receiving_items','purchase_orders','pick_orders','putaway_orders','stock_movements','lot_movements'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Drop existing write policies (named "Authenticated write/update/delete <table>")
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated write %1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated update %1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated delete %1$s" ON public.%1$I', t);

    -- Recreate restricted to admin/supervisor
    EXECUTE format($p$CREATE POLICY "Staff insert %1$s" ON public.%1$I FOR INSERT TO authenticated
      WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'))$p$, t);
    EXECUTE format($p$CREATE POLICY "Staff update %1$s" ON public.%1$I FOR UPDATE TO authenticated
      USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'))
      WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'))$p$, t);
    EXECUTE format($p$CREATE POLICY "Staff delete %1$s" ON public.%1$I FOR DELETE TO authenticated
      USING (public.has_role(auth.uid(),'admin'))$p$, t);
  END LOOP;
END $$;

-- Tighten nfe_documents and nfe_items: remove permissive public role policies
DROP POLICY IF EXISTS "Users can view nfe_documents" ON public.nfe_documents;
DROP POLICY IF EXISTS "Admins/Supervisors can insert nfe_documents" ON public.nfe_documents;
DROP POLICY IF EXISTS "Admins/Supervisors can update nfe_documents" ON public.nfe_documents;

DROP POLICY IF EXISTS "Users can view nfe_items" ON public.nfe_items;
DROP POLICY IF EXISTS "Admins/Supervisors can insert nfe_items" ON public.nfe_items;
DROP POLICY IF EXISTS "Admins/Supervisors can update nfe_items" ON public.nfe_items;

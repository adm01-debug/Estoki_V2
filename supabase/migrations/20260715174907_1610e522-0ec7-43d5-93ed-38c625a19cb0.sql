-- Função genérica de auditoria de linhas sensíveis
CREATE OR REPLACE FUNCTION public.audit_sensitive_row_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_user_nome text;
  v_action text;
  v_entity_id text;
  v_entity_label text;
  v_old jsonb;
  v_new jsonb;
BEGIN
  -- Mapear TG_OP para ação
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_new := to_jsonb(NEW);
    v_entity_id := (NEW).id::text;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_entity_id := (NEW).id::text;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_old := to_jsonb(OLD);
    v_entity_id := (OLD).id::text;
  END IF;

  -- Buscar dados do usuário (best-effort)
  IF v_user_id IS NOT NULL THEN
    SELECT email, nome INTO v_user_email, v_user_nome
    FROM public.profiles WHERE id = v_user_id;
  END IF;

  -- Label descritivo por tabela
  v_entity_label := TG_TABLE_NAME || ' ' || v_action;
  IF TG_TABLE_NAME = 'ajustes_estoque' THEN
    v_entity_label := 'Ajuste: ' || COALESCE((COALESCE(NEW, OLD)::jsonb ->> 'motivo'), '-');
  ELSIF TG_TABLE_NAME = 'orders' THEN
    v_entity_label := 'Pedido ' || COALESCE((COALESCE(NEW, OLD)::jsonb ->> 'numero'), v_entity_id);
  ELSIF TG_TABLE_NAME = 'gamificacao_transacoes' THEN
    v_entity_label := 'Transação gamificação (' || v_action || ')';
  END IF;

  INSERT INTO public.audit_log (
    user_id, user_email, user_nome,
    action, entity_type, entity_id, entity_label,
    old_values, new_values, metadata
  ) VALUES (
    v_user_id, v_user_email, v_user_nome,
    v_action, TG_TABLE_NAME, v_entity_id, v_entity_label,
    v_old, v_new,
    jsonb_build_object('trigger_op', TG_OP, 'schema', TG_TABLE_SCHEMA)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers idempotentes (drop + create)
DROP TRIGGER IF EXISTS trg_audit_ajustes_estoque ON public.ajustes_estoque;
CREATE TRIGGER trg_audit_ajustes_estoque
AFTER INSERT OR UPDATE OR DELETE ON public.ajustes_estoque
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_row_change();

DROP TRIGGER IF EXISTS trg_audit_orders ON public.orders;
CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_row_change();

DROP TRIGGER IF EXISTS trg_audit_gamificacao_transacoes ON public.gamificacao_transacoes;
CREATE TRIGGER trg_audit_gamificacao_transacoes
AFTER INSERT OR UPDATE OR DELETE ON public.gamificacao_transacoes
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_row_change();
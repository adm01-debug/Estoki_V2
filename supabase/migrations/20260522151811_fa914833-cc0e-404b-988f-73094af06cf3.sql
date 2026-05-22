-- Optimization indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_email ON public.audit_log (user_email);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders (status, created_at DESC);

-- Analyze tables to update statistics
ANALYZE public.audit_log;
ANALYZE public.stock_movements;
ANALYZE public.orders;


DROP INDEX IF EXISTS public.idx_orders_codigo;
DROP INDEX IF EXISTS public.idx_produtos_sku;
DROP INDEX IF EXISTS public.idx_produtos_barcode;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_posicoes_codigo;
DROP INDEX IF EXISTS public.idx_estoque_produto;
DROP INDEX IF EXISTS public.idx_ip_whitelist_ip;
DROP INDEX IF EXISTS public.idx_passkey_credentials_credential_id;
DROP INDEX IF EXISTS public.idx_eventos_triagem_operador;
ALTER TABLE public.conquistas_usuarios DROP CONSTRAINT IF EXISTS conquistas_usuarios_user_conquista_unique;
ALTER TABLE public.desafios_usuarios DROP CONSTRAINT IF EXISTS desafios_usuarios_user_desafio_unique;

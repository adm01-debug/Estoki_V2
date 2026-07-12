
CREATE INDEX IF NOT EXISTS idx_conquistas_usuarios_conquista ON public.conquistas_usuarios(conquista_id);
CREATE INDEX IF NOT EXISTS idx_desafios_usuarios_desafio ON public.desafios_usuarios(desafio_id);
CREATE INDEX IF NOT EXISTS idx_inventario_contagens_lote ON public.inventario_contagens(lote_id);
CREATE INDEX IF NOT EXISTS idx_inventario_contagens_posicao ON public.inventario_contagens(posicao_id);
CREATE INDEX IF NOT EXISTS idx_inventario_contagens_produto ON public.inventario_contagens(produto_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

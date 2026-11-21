-- EST01: FK aditiva products.supplier_id -> suppliers
-- Reativa o embed do PostgREST no reorder-check (registrar supplier_name).
-- 0 orfaos verificados antes de criar (producao). Nada e alterado/apagado.
alter table public.products
  add constraint fk_products_supplier
  foreign key (supplier_id) references public.suppliers (id)
  on delete set null;

-- Indice de suporte para a FK entity_versions.changed_by -> auth.users(id).
--
-- 20261127200000 criou a FK e nenhum indice no lado filho. O probe "Integridade: FKs de public
-- sem indice de suporte" passou a acusar 1 achado (entity_versions_changed_by_fkey) e a pendencia
-- indices_fk (20261126150000) voltou a ficar pendente depois de aplicar, derrubando o job
-- migrations-producao com exit 1. Sem indice, apagar um usuario faz varredura completa da tabela
-- de versoes para o ON DELETE SET NULL.

create index if not exists idx_entity_versions_changed_by
  on public.entity_versions (changed_by);

-- Prova estrutural: nenhuma FK de public pode ficar sem indice de suporte.
do $prova$
begin
  if not exists (
    select 1 from pg_index i
     where i.indrelid = 'public.entity_versions'::regclass
       and i.indisvalid
       and i.indpred is null
       and (i.indkey::smallint[])[0] = (
         select a.attnum from pg_attribute a
          where a.attrelid = 'public.entity_versions'::regclass
            and a.attname = 'changed_by'
            and not a.attisdropped
       )
  ) then
    raise exception 'FALHA entity_versions.changed_by sem indice';
  end if;

  if exists (
    select 1 from pg_constraint c
     where c.contype = 'f'
       and c.connamespace = 'public'::regnamespace
       and not exists (
         select 1 from pg_index i
          where i.indrelid = c.conrelid
            and i.indisvalid
            and i.indpred is null
            and (i.indkey::smallint[])[0:array_length(c.conkey, 1) - 1] = c.conkey
       )
  ) then
    raise exception 'FALHA ainda existe FK de public sem indice de suporte';
  end if;
end
$prova$;
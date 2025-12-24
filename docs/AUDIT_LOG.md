# Audit Log - ESTOKI WMS

## Eventos Auditados

- Criação/edição/exclusão de registros
- Login/logout de usuários
- Alterações de permissão
- Operações críticas

## Estrutura

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ
);
```

## Retenção

- Logs mantidos por 2 anos
- Backup mensal para arquivo

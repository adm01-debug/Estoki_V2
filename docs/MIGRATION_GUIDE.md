# 🔄 ESTOKI - Guia de Migração

## Versão 1.0 → 2.0

### Breaking Changes

1. **Estrutura de Pastas**
   - `src/components/ui` reorganizado
   - Novos componentes em `src/components/common`

2. **Hooks**
   - `useEstoque` agora retorna objeto com métodos
   - `useTriagem` aceita parâmetros adicionais

3. **Services**
   - Todos os services agora usam tabelas Supabase corretas
   - `auditService` → `alertas_historico`
   - `gamificacaoService` → `gamificacao_usuarios`

### Migrando o Código

```typescript
// Antes
import { useEstoque } from '@/hooks/useEstoque';
const estoque = useEstoque();

// Depois
import { useEstoque } from '@/hooks/useEstoque';
const { data, loading, error, refetch } = useEstoque();
```

### Banco de Dados

Execute as migrations na ordem:
1. `20251216141003_*.sql`
2. `20251220110629_*.sql`
3. Demais em ordem cronológica

### Variáveis de Ambiente

Novas variáveis obrigatórias:
- `VITE_SENTRY_DSN`
- `VITE_GA_TRACKING_ID`

### Suporte

Em caso de problemas, abra uma issue no GitHub.

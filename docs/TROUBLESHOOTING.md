# Solução de Problemas - ESTOKI

## Problemas Comuns

### 1. Erro de Autenticação

**Sintoma**: Redirecionado para login repetidamente

**Solução**:
```bash
# Limpar localStorage
localStorage.clear()

# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### 2. Dados Não Carregam

**Sintoma**: Tela de loading infinita

**Verificar**:
1. Console do browser para erros
2. Network tab para requests falhando
3. RLS policies no Supabase

**Solução**:
```sql
-- Verificar RLS no Supabase
SELECT * FROM pg_policies WHERE tablename = "sua_tabela";
```

### 3. Build Falha

**Sintoma**: `npm run build` com erros

**Solução**:
```bash
# Limpar cache
rm -rf node_modules/.cache
rm -rf dist

# Reinstalar dependências
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### 4. TypeScript Errors

**Sintoma**: Erros de tipo em IDE

**Solução**:
```bash
# Reiniciar TypeScript server
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"

# Regenerar tipos do Supabase
npm run supabase:types
```

### 5. Testes Falham

**Sintoma**: `npm test` com falhas

**Solução**:
```bash
# Limpar cache do Vitest
rm -rf node_modules/.vitest

# Executar teste específico
npm test -- --run useEstoque

# Ver logs detalhados
npm test -- --reporter=verbose
```

### 6. Supabase Edge Functions

**Sintoma**: Function retorna 500

**Verificar**:
```bash
# Logs no Supabase Dashboard
# Functions -> Logs

# Testar localmente
supabase functions serve nome-da-function
```

### 7. Performance Lenta

**Sintoma**: Aplicação travando

**Verificar**:
1. React DevTools Profiler
2. Network waterfall
3. Console para warnings

**Solução**:
- Adicionar React.memo
- Verificar re-renders desnecessários
- Implementar virtualização

## Logs Úteis

### Browser Console
```javascript
// Verificar estado do auth
console.log(supabase.auth.getSession());

// Verificar cache do React Query
console.log(queryClient.getQueryCache().getAll());
```

### Supabase
```sql
-- Verificar últimas queries
SELECT * FROM pg_stat_activity;

-- Verificar RLS
SELECT * FROM pg_policies;
```

## Contato

Se o problema persistir:
1. Abra uma issue no GitHub
2. Inclua: logs, passos para reproduzir, ambiente


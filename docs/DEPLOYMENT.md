# 🚀 Guia de Deploy

Este documento descreve o processo de deploy do ESTOKI.

## Ambientes

| Ambiente | URL | Branch |
|----------|-----|--------|
| Desenvolvimento | localhost:5173 | develop |
| Staging | estoki-staging.lovable.dev | develop |
| Produção | estoki.lovable.dev | main |

## Pré-requisitos

- Node.js 20+
- npm ou yarn
- Acesso ao Supabase
- Variáveis de ambiente configuradas

## Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Opcional
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

## Deploy Manual

### 1. Build Local

```bash
# Instalar dependências
npm install

# Verificar tipos
npm run type-check

# Executar testes
npm test

# Build de produção
npm run build

# Preview do build
npm run preview
```

### 2. Deploy via Lovable

O deploy principal é feito automaticamente pelo Lovable:

1. Faça merge para a branch `main`
2. O Lovable detecta automaticamente
3. Build e deploy são executados
4. URL de produção é atualizada

## Deploy Supabase

### Edge Functions

```bash
# Login no Supabase
supabase login

# Deploy de uma função
supabase functions deploy scanner-ocr

# Deploy de todas as funções
supabase functions deploy
```

### Migrations

```bash
# Push das migrations
supabase db push

# Verificar status
supabase db status
```

## CI/CD Pipeline

O GitHub Actions executa automaticamente:

1. **Push para main/develop**
   - Lint
   - Type check
   - Testes
   - Build

2. **Pull Requests**
   - Verificações acima
   - Preview do build

### Workflow

```yaml
# .github/workflows/ci.yml
- Checkout
- Setup Node.js
- Install dependencies
- ESLint
- Type check
- Tests
- Build
- Upload artifacts
```

## Rollback

### Lovable
1. Acesse o histórico de deploys
2. Selecione uma versão anterior
3. Clique em "Rollback"

### Manual
```bash
# Checkout da versão anterior
git checkout <commit-hash>

# Rebuild e deploy
npm run build
# Deploy manual ou via git push
```

## Monitoramento

### Logs
- **Aplicação**: Console do browser, Lovable logs
- **Supabase**: Dashboard > Logs
- **Edge Functions**: Dashboard > Functions > Logs

### Métricas
- Performance: Lighthouse, Web Vitals
- Erros: Console, Supabase logs
- Uso: Supabase Dashboard

## Checklist de Deploy

- [ ] Testes passando
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas
- [ ] Edge Functions deployadas
- [ ] Smoke test após deploy
- [ ] Verificar logs de erros

## Troubleshooting

### Build falha
```bash
# Limpar cache
rm -rf node_modules .vite dist
npm install
npm run build
```

### Edge Function não funciona
```bash
# Verificar logs
supabase functions logs scanner-ocr

# Testar localmente
supabase functions serve scanner-ocr
```

### Erro 500 em produção
1. Verificar logs do Supabase
2. Verificar status das Edge Functions
3. Verificar migrations pendentes
4. Verificar variáveis de ambiente

## Contatos

- **DevOps**: devops@empresa.com
- **Supabase Support**: support.supabase.com
- **Lovable Support**: lovable.dev/support

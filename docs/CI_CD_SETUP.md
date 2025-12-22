# 🚀 Configuração CI/CD - ESTOKI

## GitHub Actions

### Workflows Disponíveis

1. **ci.yml** - Integração Contínua
   - Lint e type-check
   - Testes unitários
   - Build de produção

2. **deploy.yml** - Deploy Automático
   - Deploy para Vercel
   - Somente branch main

3. **e2e.yml** - Testes E2E
   - Playwright tests
   - Screenshots de falha

4. **lighthouse.yml** - Auditoria
   - Performance
   - Acessibilidade
   - SEO

5. **security.yml** - Segurança
   - Snyk scan
   - Dependabot alerts

## Secrets Necessários

Configure em: **Settings > Secrets > Actions**

### Supabase
| Secret | Descrição | Onde obter |
|--------|-----------|------------|
| `VITE_SUPABASE_URL` | URL do projeto | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima | Supabase Dashboard > Settings > API |

### Vercel
| Secret | Descrição | Onde obter |
|--------|-----------|------------|
| `VERCEL_TOKEN` | Token de API | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | ID da organização | vercel.com/[team]/settings |
| `VERCEL_PROJECT_ID` | ID do projeto | vercel.com/[project]/settings |

### Segurança (Opcional)
| Secret | Descrição | Onde obter |
|--------|-----------|------------|
| `SNYK_TOKEN` | Token Snyk | snyk.io/account |
| `SLACK_WEBHOOK_URL` | Webhook Slack | api.slack.com/apps |

## Configuração Passo a Passo

### 1. Supabase
```bash
# Obter credenciais
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie URL e anon key
```

### 2. Vercel
```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Linkar projeto
vercel link

# Obter IDs
cat .vercel/project.json
```

### 3. Adicionar Secrets
```bash
# Via GitHub CLI
gh secret set VITE_SUPABASE_URL --body "https://xxx.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --body "eyJhbG..."
gh secret set VERCEL_TOKEN --body "xxx"
gh secret set VERCEL_ORG_ID --body "team_xxx"
gh secret set VERCEL_PROJECT_ID --body "prj_xxx"
```

## Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Produção (Vercel)
Configurar em: vercel.com/[project]/settings/environment-variables

## Troubleshooting

### Build Falhou
1. Verificar logs do Actions
2. Confirmar secrets configurados
3. Testar build local: `npm run build`

### Deploy Falhou
1. Verificar VERCEL_TOKEN válido
2. Confirmar IDs corretos
3. Verificar permissões do token

### Testes Falharam
1. Verificar se deps estão instaladas
2. Rodar local: `npm run test`
3. Verificar mocks do Supabase

---
*Atualizado em Dezembro 2025*

# 🚀 ESTOKI WMS - Guia de Deploy para Produção

## 📋 Pré-requisitos

- [ ] Node.js 18+ instalado
- [ ] Conta no Supabase configurada
- [ ] Domínio configurado (opcional)
- [ ] SSL/TLS configurado
- [ ] Variáveis de ambiente definidas

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.production` com:

```env
# Supabase (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

# Ambiente
VITE_APP_ENV=production
VITE_API_URL=https://api.seudominio.com.br

# Monitoramento (RECOMENDADO)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Features
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=true

# Integrações
VITE_BITRIX24_WEBHOOK_URL=https://promobrindes.bitrix24.com.br/rest/1/xxx/
VITE_CORREIOS_API_KEY=sua-api-key
```

## 📦 Build para Produção

```bash
# 1. Instalar dependências
npm ci

# 2. Rodar testes
npm run test

# 3. Build de produção
npm run build

# 4. Preview local (opcional)
npm run preview
```

## 🗄️ Configuração do Banco de Dados

```bash
# 1. Aplicar migrations
npx supabase db push

# 2. Rodar seed inicial
npx supabase db seed

# 3. Verificar RLS policies
npx supabase db diff
```

## ⚡ Deploy das Edge Functions

```bash
# Deploy de todas as funções
npx supabase functions deploy

# Ou deploy individual
npx supabase functions deploy health-check
npx supabase functions deploy stock-alert
npx supabase functions deploy nfe-process
```

## 🌐 Deploy no Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar variáveis de ambiente no dashboard
```

## 🐳 Deploy com Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build e run
docker build -t estoki-wms .
docker run -p 80:80 estoki-wms
```

## ✅ Checklist Pré-Deploy

### Segurança
- [ ] Variáveis sensíveis em `.env`, não no código
- [ ] CORS configurado corretamente
- [ ] RLS habilitado em todas as tabelas
- [ ] HTTPS obrigatório
- [ ] Rate limiting configurado

### Performance
- [ ] Assets otimizados (imagens, fonts)
- [ ] Code splitting habilitado
- [ ] Cache headers configurados
- [ ] Gzip/Brotli habilitado
- [ ] CDN configurado (opcional)

### Monitoramento
- [ ] Sentry configurado para erros
- [ ] Analytics configurado
- [ ] Health check endpoint funcionando
- [ ] Logs estruturados

### Funcionalidades
- [ ] PWA manifest correto
- [ ] Service Worker funcionando
- [ ] Offline mode testado
- [ ] Push notifications configuradas (opcional)

## 🔄 Rollback

Em caso de problemas:

```bash
# Vercel
vercel rollback

# Docker
docker run -p 80:80 estoki-wms:previous-version

# Supabase (migrations)
npx supabase db reset --version <previous-version>
```

## 📊 Monitoramento Pós-Deploy

1. **Verificar Health Check**
   ```bash
   curl https://seu-dominio.com.br/api/health
   ```

2. **Verificar Logs**
   - Supabase Dashboard > Logs
   - Sentry Dashboard
   - Vercel Functions Logs

3. **Verificar Métricas**
   - Google Analytics
   - Supabase Dashboard > Usage

## 🆘 Troubleshooting

### Erro 500 no deploy
- Verificar logs do servidor
- Verificar variáveis de ambiente
- Verificar conexão com Supabase

### PWA não instala
- Verificar manifest.json
- Verificar HTTPS
- Verificar service worker

### Dados não aparecem
- Verificar RLS policies
- Verificar token de auth
- Verificar CORS

## 📞 Suporte

- **Documentação:** https://docs.estoki.com.br
- **Issues:** https://github.com/adm01-debug/estoki/issues
- **Email:** suporte@promobrindes.com.br

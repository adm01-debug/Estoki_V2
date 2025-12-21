# Política de Segurança - ESTOKI

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Envie um email para: security@promobrindes.com.br
3. Inclua detalhes da vulnerabilidade
4. Aguarde confirmação antes de divulgar

## Práticas de Segurança

### Autenticação

- ✅ Supabase Auth com JWT
- ✅ Session timeout configurado
- ✅ Row Level Security (RLS) em todas as tabelas
- ⏳ 2FA (em implementação)

### Dados

- ✅ Criptografia em trânsito (HTTPS)
- ✅ Criptografia em repouso (Supabase)
- ✅ Sanitização de inputs
- ✅ Validação server-side

### Frontend

- ✅ CSP Headers configurados
- ✅ XSS Prevention
- ✅ CSRF Protection
- ✅ Secure Cookies

### API/Edge Functions

- ✅ Rate Limiting
- ✅ Input Validation
- ✅ CORS Restritivo
- ✅ Logging de Acessos

## Checklist de Segurança para PRs

- [ ] Sem credenciais hardcoded
- [ ] Inputs validados e sanitizados
- [ ] Sem console.log com dados sensíveis
- [ ] RLS policies atualizadas se necessário
- [ ] Dependências atualizadas (npm audit)

## Dependências

Executamos `npm audit` regularmente e atualizamos dependências com vulnerabilidades conhecidas.

```bash
npm audit
npm audit fix
```

## Contato

- Email: security@promobrindes.com.br
- Response Time: 48 horas


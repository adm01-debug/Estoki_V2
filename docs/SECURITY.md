# 🔒 Política de Segurança - ESTOKI

## Versões Suportadas

| Versão | Suportada |
|--------|-----------|
| 1.0.x  | ✅        |

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Envie email para: security@estoki.com
3. Inclua:
   - Descrição detalhada
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se tiver)

## Práticas de Segurança

### Credenciais
- ✅ Variáveis de ambiente para secrets
- ✅ .env no .gitignore
- ✅ Rotação periódica de chaves
- ❌ NUNCA commitar credenciais

### Autenticação
- JWT com expiração
- Refresh tokens seguros
- Rate limiting ativo
- Bloqueio após tentativas falhas

### Banco de Dados
- RLS (Row Level Security) em todas as tabelas
- Políticas por usuário/role
- Conexões criptografadas (SSL)

### Frontend
- Sanitização de inputs
- CSP headers configurados
- HTTPS obrigatório

### CI/CD
- Secrets do GitHub Actions
- Scans de segurança automáticos
- Dependabot habilitado

## Checklist de Segurança

- [ ] Credenciais não expostas no código
- [ ] RLS ativo em novas tabelas
- [ ] Inputs validados e sanitizados
- [ ] Dependências atualizadas
- [ ] Logs não expõem dados sensíveis

## Incidentes

Em caso de incidente:
1. Isolar o problema
2. Revogar credenciais comprometidas
3. Investigar a causa
4. Corrigir a vulnerabilidade
5. Documentar o incidente
6. Comunicar stakeholders

---
*Última atualização: Dezembro 2025*

# 🛠️ Runbook Operacional — ESTOKI WMS

## Deploy

1. Push para branch `main` → CI roda lint + types + tests
2. Lovable Cloud faz deploy automático após merge
3. Edge Functions são deployadas automaticamente

## Rollback

1. Lovable: restaurar versão anterior via histórico de versões
2. Database: migrations são incrementais — criar migration reversa se necessário
3. Tempo alvo: < 5 minutos

## Incidentes

### Severidades
| Sev | Descrição | SLA |
|---|---|---|
| P1 | Sistema indisponível | 15 min resposta |
| P2 | Funcionalidade crítica degradada | 1h resposta |
| P3 | Bug não-bloqueante | 24h resposta |

### Procedimento
1. **Detectar**: Alerta automático ou report de usuário
2. **Comunicar**: Notificar equipe via canal de incidentes
3. **Mitigar**: Rollback ou feature flag desativado
4. **Resolver**: Fix + deploy
5. **Post-mortem**: Documento com causa raiz e ações preventivas

## Cenários Comuns

### DB lento
- Checar índices com `EXPLAIN ANALYZE`
- Verificar connection pooling
- Executar `VACUUM ANALYZE` se necessário

### Edge Function falhando
- Checar logs via Lovable Cloud → Backend
- Verificar secrets configurados
- Validar input schemas (Zod)

### Integração externa offline
- Circuit breaker abre automaticamente após 3-5 falhas
- Sistema degrada gracefully
- Monitorar estado dos circuitos

### Estoque inconsistente
- Usar módulo Inventário Cíclico para reconciliação
- Verificar `version` column para conflitos de concorrência
- Checar audit trail em `movimentacoes`

## 📊 Monitoramento Diário

- [ ] Verificar dashboard de métricas
- [ ] Revisar alertas pendentes
- [ ] Verificar filas de processamento
- [ ] Analisar erros no error tracking

## 🔧 Manutenção Semanal

- [ ] Limpeza de logs antigos
- [ ] Atualização de dependências (Dependabot PRs)
- [ ] Revisão de performance
- [ ] Verificar estado dos circuit breakers

## 📞 Contatos de Emergência

| Função | Nome | Contato |
|--------|------|---------|
| DevOps | TBD | - |
| DBA | TBD | - |
| PM | TBD | - |

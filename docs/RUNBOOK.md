# Runbook Operacional ESTOKI WMS

## 🚨 Procedimentos de Emergência

### Sistema Fora do Ar
1. Verificar status do Supabase: `https://status.supabase.com`
2. Verificar logs: `npm run logs`
3. Reiniciar serviços: `docker-compose restart`
4. Notificar equipe via Slack #estoki-ops

### Banco de Dados Lento
1. Verificar conexões ativas no Supabase Dashboard
2. Analisar queries lentas: `SELECT * FROM pg_stat_activity`
3. Executar VACUUM se necessário
4. Verificar índices

### Erro de Autenticação em Massa
1. Verificar JWT secret no Supabase
2. Limpar cache de sessões
3. Verificar rate limits

## 📊 Monitoramento Diário

- [ ] Verificar dashboard de métricas
- [ ] Revisar alertas pendentes
- [ ] Verificar filas de processamento
- [ ] Analisar erros no Sentry

## 🔧 Manutenção Semanal

- [ ] Backup do banco de dados
- [ ] Limpeza de logs antigos
- [ ] Atualização de dependências
- [ ] Revisão de performance

## 📞 Contatos de Emergência

| Função | Nome | Contato |
|--------|------|---------|
| DevOps | TBD | - |
| DBA | TBD | - |
| PM | TBD | - |

# Monitoramento ESTOKI WMS

## 📊 Métricas Principais

### Performance
- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.5s
- **CLS** (Cumulative Layout Shift): < 0.1

### Infraestrutura
- CPU Usage: < 70%
- Memory Usage: < 80%
- Disk Usage: < 85%
- Response Time P95: < 500ms

### Negócio
- Taxa de erro de API: < 1%
- Uptime: > 99.9%
- Pedidos processados/hora
- Tempo médio de picking

## 🛠️ Ferramentas

### Sentry (Erros)
- Dashboard: https://sentry.io/estoki
- Alertas configurados para erros críticos

### Lighthouse CI
- Roda em cada PR
- Threshold: 90+ em todas métricas

### Supabase Dashboard
- Conexões ativas
- Query performance
- Storage usage

## 🚨 Alertas

| Métrica | Warning | Critical |
|---------|---------|----------|
| CPU | > 70% | > 90% |
| Memory | > 75% | > 90% |
| Error Rate | > 1% | > 5% |
| Response Time | > 500ms | > 2s |

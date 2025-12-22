# 🔌 Integrações - ESTOKI

## Supabase

### Configuração
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Recursos Utilizados
- **Database**: PostgreSQL
- **Auth**: Autenticação de usuários
- **Storage**: Upload de arquivos
- **Realtime**: Atualizações em tempo real
- **Edge Functions**: Serverless functions

### Row Level Security (RLS)
Todas as tabelas têm RLS ativado:
```sql
ALTER TABLE tabela ENABLE ROW LEVEL SECURITY;
```

## Edge Functions

### alerta-divergencia-fornecedor
- **Trigger**: Divergência detectada
- **Ação**: Envia notificação

### calculate-kpis
- **Trigger**: Agendado (cron)
- **Ação**: Calcula KPIs diários

### gerar-desafios-diarios
- **Trigger**: Diário às 00:00
- **Ação**: Gera desafios do dia

### previsao-demanda
- **Trigger**: Manual/Agendado
- **Ação**: Calcula previsão de demanda

### scanner-ocr
- **Trigger**: Upload de imagem
- **Ação**: Extrai texto via OCR

## Slack (Opcional)

### Configuração
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Notificações
- Alertas de estoque baixo
- Divergências de recebimento
- Relatórios diários

## Webhooks

### Recebimento
```
POST /api/webhooks/recebimento
Content-Type: application/json

{
  "nf_numero": "12345",
  "fornecedor": "XPTO",
  "itens": [...]
}
```

### Movimentação
```
POST /api/webhooks/movimentacao
Content-Type: application/json

{
  "tipo": "saida",
  "lote_id": "...",
  "quantidade": 10
}
```

## APIs Externas

### NFe
- Validação de XML
- Extração de dados
- Parser customizado

### CEP (ViaCEP)
```javascript
fetch(`https://viacep.com.br/ws/${cep}/json/`)
```

## Autenticação

### JWT
- Token no header: `Authorization: Bearer <token>`
- Expiração: 1 hora
- Refresh: Automático

### OAuth (Futuro)
- Google
- Microsoft

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| API | 100 req/min |
| Upload | 10 req/min |
| Webhooks | 50 req/min |

## Monitoramento

### Sentry
```env
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Analytics
- Page views
- Eventos customizados
- Erros

---
*Atualizado em Dezembro 2025*

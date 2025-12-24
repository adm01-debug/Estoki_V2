# Webhooks - ESTOKI WMS

## Endpoints Disponíveis

### Receber Webhooks
`POST /api/webhooks/:provider`

### Eventos Emitidos
- `order.created`
- `order.shipped`
- `inventory.low`
- `receiving.completed`

## Configuração

```typescript
// supabase/functions/webhook-handler/index.ts
```

## Segurança

- Validação de assinatura HMAC
- Rate limiting por IP
- Logs de auditoria

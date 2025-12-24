# Realtime - ESTOKI WMS

## Visão Geral

Sistema de atualização em tempo real usando Supabase Realtime.

## Canais

- `inventory:*` - Atualizações de estoque
- `orders:*` - Status de pedidos
- `alerts:*` - Alertas do sistema

## Uso

```typescript
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const { data } = useRealtimeSubscription('inventory', {
  event: 'UPDATE',
  filter: 'warehouse_id=eq.123'
});
```

## Performance

- Conexões são gerenciadas automaticamente
- Reconexão automática em caso de falha

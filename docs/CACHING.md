# 🗄️ Caching Strategy — ESTOKI WMS

## Camadas de Cache

### 1. TanStack Query (Client-side)
- **staleTime**: 5 min para dados operacionais, 30 min para configs
- **gcTime**: 10 min (garbage collection após unmount)
- **refetchOnWindowFocus**: Ativo em produção
- **Invalidação**: Via `queryClient.invalidateQueries()` após mutations

```typescript
// Padrão de cache por domínio
const CACHE_CONFIG = {
  operational: { staleTime: 5 * 60 * 1000 },   // Estoque, tarefas
  config: { staleTime: 30 * 60 * 1000 },        // Metas, configs
  realtime: { staleTime: 0 },                    // Notificações
  reports: { staleTime: 15 * 60 * 1000 },        // Relatórios
};
```

### 2. Service Worker (PWA)
- **Estratégia**: `StaleWhileRevalidate` para assets estáticos
- **Precache**: Build assets (JS, CSS, fonts)
- **Runtime cache**: API calls com `NetworkFirst` (fallback offline)

### 3. Browser Cache (HTTP)
- Assets estáticos: `Cache-Control: public, max-age=31536000, immutable` (via Vite hash)
- API responses: Sem cache (dados dinâmicos)
- Imagens de triagem: Cache local via `CacheStorage`

### 4. CDN (Lovable/Cloudflare)
- Assets estáticos: Edge cache automático
- Edge Functions: Sem cache (operações mutáveis)

## Invalidação

| Evento | Ação |
|---|---|
| Mutation (create/update/delete) | `invalidateQueries` no domínio afetado |
| Realtime event (Supabase) | `setQueryData` ou `invalidateQueries` |
| Login/logout | `queryClient.clear()` |
| Deploy novo | Service Worker atualiza precache |

## Otimizações Implementadas

1. **Prefetch de rotas**: `queryClient.prefetchQuery` em hover/idle
2. **Optimistic updates**: Atualização local imediata + rollback on error
3. **Deduplicação**: TanStack Query deduplicates requests automáticos
4. **Lazy loading de libs**: jsPDF, ExcelJS carregados sob demanda
5. **Imagens**: `loading="lazy"` + `decoding="async"`

## Métricas-Alvo

| Métrica | Alvo | Atual |
|---|---|---|
| LCP | < 2.5s | ~2.1s |
| FID/INP | < 100ms | ~80ms |
| Cache Hit Rate (SW) | > 90% | N/A (monitoring TBD) |
| Query Stale Rate | < 20% | N/A |

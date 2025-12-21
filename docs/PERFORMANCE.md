# Guia de Performance - ESTOKI

## Métricas Alvo (Core Web Vitals)

| Métrica | Alvo | Descrição |
|---------|------|-----------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTI | < 3.8s | Time to Interactive |

## Otimizações Implementadas

### Code Splitting

```typescript
// Lazy loading de rotas
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Estoque = lazy(() => import("./pages/Estoque"));
```

### Memoização

```typescript
// React.memo para componentes puros
export const KPICard = memo(({ title, value }) => {
  return <Card>{/* ... */}</Card>;
});

// useMemo para cálculos caros
const sortedItems = useMemo(() => 
  items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// useCallback para funções estáveis
const handleClick = useCallback(() => {
  // ...
}, [dependency]);
```

### Virtualização

Para listas longas, usar react-window:

```typescript
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={400}
  itemCount={items.length}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

### Debounce/Throttle

```typescript
// Debounce em campos de busca
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);

// Throttle em scroll
const throttledScroll = useMemo(
  () => throttle(handleScroll, 100),
  []
);
```

## Bundle Size

Manter bundle abaixo de 500KB gzipped.

```bash
# Analisar bundle
npm run build -- --analyze
```

## Checklist de Performance

- [ ] Lazy loading em rotas pesadas
- [ ] React.memo em componentes puros
- [ ] useMemo/useCallback onde necessário
- [ ] Imagens otimizadas (WebP)
- [ ] Debounce em inputs de busca
- [ ] Virtualização em listas > 100 itens
- [ ] Prefetch de dados críticos

## Monitoramento

- Lighthouse CI no pipeline
- Real User Monitoring (RUM)
- Web Vitals tracking


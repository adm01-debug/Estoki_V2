# State Management - ESTOKI WMS

## Arquitetura

- **Zustand** - Estado global da aplicação
- **TanStack Query** - Cache de dados do servidor
- **Jotai** - Estado atômico para UI

## Stores

```
src/stores/
├── index.ts        # Store principal
├── authStore.ts    # Autenticação
├── uiStore.ts      # Estado da UI
└── cartStore.ts    # Carrinho/seleções
```

## Padrões

- Queries para dados do servidor
- Mutations para operações
- Stores para estado local

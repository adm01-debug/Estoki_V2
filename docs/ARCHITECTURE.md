# Arquitetura do ESTOKI

## Visão Geral

O ESTOKI é um sistema de gestão de estoque e operações logísticas construído com tecnologias modernas e arquitetura orientada a componentes.

## Stack Tecnológico

### Frontend
- **React 18.3** - Biblioteca de UI
- **TypeScript 5.8** - Tipagem estática
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Estilização
- **shadcn/ui** - Componentes de UI
- **React Router 6** - Roteamento
- **TanStack Query 5** - Gerenciamento de estado servidor
- **Framer Motion** - Animações

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL (banco de dados)
  - Auth (autenticação)
  - Edge Functions (serverless)
  - Realtime (subscriptions)

## Estrutura de Diretórios

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui (49)
│   ├── layout/         # Layout (AppLayout, Breadcrumbs)
│   ├── dashboard/      # Cards e métricas
│   ├── estoque/        # Componentes de estoque
│   ├── gamificacao/    # Sistema de gamificação
│   ├── scanner/        # QR/OCR Scanner
│   └── triagem/        # Componentes de triagem
├── hooks/              # Custom hooks (34)
├── pages/              # Páginas da aplicação (27)
├── types/              # Definições de tipos
├── utils/              # Funções utilitárias
├── contexts/           # React Contexts
└── integrations/       # Integrações (Supabase)
```

## Padrões de Arquitetura

### 1. Hooks como Camada de Dados

Todos os acessos ao banco de dados são encapsulados em hooks customizados:

```typescript
// ❌ Não fazer
const { data } = await supabase.from('produtos').select();

// ✅ Fazer
const { produtos, loading } = useEstoque();
```

### 2. Separação de Responsabilidades

- **Pages**: Orquestração e layout
- **Components**: UI e interações
- **Hooks**: Lógica de negócio e dados
- **Types**: Definições de tipos
- **Utils**: Funções utilitárias puras

### 3. Estado do Servidor

Utilizamos TanStack Query para:
- Cache automático
- Invalidação inteligente
- Loading/Error states
- Realtime updates

## Módulos do Sistema

### Estoque
- Gestão de posições
- Ocupação por porta-palete
- Movimentações

### Recebimento
- Conferência de mercadorias
- Integração com balança
- Divergências

### Triagem
- Checklist de inspeção
- Timer de produtividade
- Fotos obrigatórias

### Expedição
- Romaneios de entrega
- Rastreamento
- Comprovantes

### Gamificação
- Conquistas
- Desafios diários
- Ranking
- Sistema de XP

### KPIs
- Métricas operacionais
- Metas
- Alertas inteligentes

## Edge Functions

| Função | Descrição |
|--------|-----------|
| `scanner-ocr` | Processamento de imagens com IA |
| `previsao-demanda` | Previsão de demanda com ML |
| `gerar-desafios-diarios` | Geração automática de desafios |
| `alerta-divergencia-fornecedor` | Alertas de qualidade |

## Banco de Dados

33 tabelas organizadas por domínio:
- **Estoque**: lotes, produtos, posicoes_estoque
- **Operação**: metricas_operacionais, tarefas
- **Gamificação**: conquistas_*, desafios_*, streaks_*
- **Expedição**: romaneios, romaneio_itens

## Contribuindo

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guias de contribuição.

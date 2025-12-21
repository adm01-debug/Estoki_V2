# 📄 Páginas da Aplicação

Este documento descreve todas as páginas do ESTOKI, suas responsabilidades e componentes utilizados.

## Estrutura de Páginas

```
src/pages/
├── Index.tsx                 # Página inicial/home
├── Auth.tsx                  # Autenticação
├── Dashboard.tsx             # Dashboard gerencial
├── DashboardTriador.tsx      # Dashboard do triador
├── Recebimento.tsx           # Lista de recebimentos
├── ConferenciaRecebimento.tsx # Conferência de recebimento
├── Triagem.tsx               # Lista de triagens
├── FormularioTriagem.tsx     # Formulário de triagem
├── Estoque.tsx               # Gestão de estoque
├── Scanner.tsx               # Scanner de códigos
├── Movimentacao.tsx          # Movimentações de estoque
├── Armazenamento.tsx         # Mapa de armazenamento
├── InventarioCiclico.tsx     # Inventário cíclico
├── CurvaABC.tsx              # Análise curva ABC
├── GestaoTarefas.tsx         # Gestão de tarefas
├── AlertasInteligentes.tsx   # Central de alertas
├── KPIsOperacionais.tsx      # KPIs operacionais
├── Rastreabilidade.tsx       # Rastreabilidade
├── Produtividade.tsx         # Relatórios de produtividade
├── Relatorios.tsx            # Central de relatórios
├── RelatorioFornecedores.tsx # Qualidade de fornecedores
├── RelatorioDivergencias.tsx # Relatório de divergências
├── TrocasDevolucoes.tsx      # Gestão de trocas/devoluções
├── DashboardTrocas.tsx       # Dashboard de trocas
├── Romaneios.tsx             # Gestão de romaneios
├── Configuracoes.tsx         # Configurações
└── NotFound.tsx              # Página 404
```

## Páginas por Módulo

### 🏠 Core
| Página | Rota | Descrição |
|--------|------|-----------|
| Index | `/` | Home com acesso rápido |
| Auth | `/auth` | Login/logout |
| Dashboard | `/dashboard` | Visão gerencial |
| Configuracoes | `/configuracoes` | Configurações do sistema |

### 📦 Recebimento
| Página | Rota | Descrição |
|--------|------|-----------|
| Recebimento | `/recebimento` | Lista de recebimentos |
| ConferenciaRecebimento | `/recebimento/:id` | Conferência detalhada |

### ✅ Triagem
| Página | Rota | Descrição |
|--------|------|-----------|
| Triagem | `/triagem` | Lista de triagens pendentes |
| FormularioTriagem | `/triagem/:id` | Formulário de triagem |
| DashboardTriador | `/minha-produtividade` | Performance do triador |

### 📊 Estoque
| Página | Rota | Descrição |
|--------|------|-----------|
| Estoque | `/estoque` | Gestão de estoque |
| Movimentacao | `/movimentacao` | Movimentações |
| Armazenamento | `/armazenamento` | Mapa de posições |
| Scanner | `/scanner` | Scanner de códigos |
| InventarioCiclico | `/inventario-ciclico` | Inventário |
| CurvaABC | `/curva-abc` | Análise ABC |

### 📈 Relatórios
| Página | Rota | Descrição |
|--------|------|-----------|
| Relatorios | `/relatorios` | Central de relatórios |
| Produtividade | `/produtividade` | Produtividade |
| KPIsOperacionais | `/kpis` | KPIs |
| RelatorioFornecedores | `/qualidade-fornecedores` | Fornecedores |
| RelatorioDivergencias | `/divergencias` | Divergências |
| Rastreabilidade | `/rastreabilidade` | Rastreio |

### 🔄 Trocas
| Página | Rota | Descrição |
|--------|------|-----------|
| TrocasDevolucoes | `/trocas-devolucoes` | Gestão de T&D |
| DashboardTrocas | `/dashboard-trocas` | Dashboard T&D |

### 🚚 Logística
| Página | Rota | Descrição |
|--------|------|-----------|
| Romaneios | `/romaneios` | Romaneios de expedição |

## Métricas de Páginas

| Página | Linhas | Status |
|--------|--------|--------|
| TrocasDevolucoes | ~700 | ⚠️ Refatorando |
| Estoque | ~784 | ⚠️ Refatorando |
| KPIsOperacionais | ~709 | ⚠️ Refatorando |
| FormularioTriagem | ~400 | ✅ OK |
| Dashboard | ~533 | ⚠️ Monitorar |

## Padrões de Implementação

### Layout
Todas as páginas usam o `AppLayout`:
```tsx
export default function MinhaPage() {
  return (
    <AppLayout title="Título" showBack>
      {/* conteúdo */}
    </AppLayout>
  );
}
```

### Loading States
```tsx
if (loading) {
  return (
    <AppLayout title="Título">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </AppLayout>
  );
}
```

### Error States
```tsx
if (error) {
  return (
    <AppLayout title="Título">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </AppLayout>
  );
}
```

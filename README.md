# 📦 ESTOKI - Sistema de Gestão de Estoque

Sistema completo de gestão de estoque para operações de recebimento, triagem, armazenamento e expedição, com gamificação para engajamento da equipe.

## 🚀 Funcionalidades

### Operações
- **Recebimento**: Conferência de materiais, registro de divergências, fotos de evidência
- **Triagem**: Checklist de qualidade (7 critérios), registro de defeitos, amostragem
- **Armazenamento**: Endereçamento por porta-paletes e boxes, QR Codes
- **Movimentação**: Transferências, ajustes, rastreabilidade completa
- **Scanner QR**: Leitura de etiquetas para operações rápidas

### Gestão
- **Dashboard**: KPIs em tempo real, ocupação, movimentações
- **Produtividade**: Métricas por operador, ranking, metas
- **Relatórios**: Movimentações, inventário, qualidade
- **Alertas Inteligentes**: Estoque baixo, vencimento, itens parados

### Qualidade
- **Inventário Cíclico**: Contagens programadas, divergências
- **Curva ABC**: Classificação de produtos por valor/giro
- **Qualidade Fornecedores**: Pontualidade, taxa de problemas
- **Trocas e Devoluções**: Workflow completo de tratativas

### Gamificação
- **XP e Níveis**: Pontuação por ações realizadas
- **Conquistas**: Badges por metas atingidas
- **Desafios Diários**: Metas rotativas com recompensas
- **Streaks**: Bônus por dias consecutivos
- **Ranking**: Leaderboard de produtividade

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Tailwind CSS + Radix UI + shadcn/ui + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Realtime)
- **QR Code**: html5-qrcode
- **PDF**: jsPDF
- **Gráficos**: Recharts

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase

## 🔧 Instalação

```bash
# Clonar repositório
git clone https://github.com/adm01-debug/estoki.git
cd estoki

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# Iniciar desenvolvimento
npm run dev
```

## ⚙️ Variáveis de Ambiente

```env
VITE_SUPABASE_PROJECT_ID=seu_project_id
VITE_SUPABASE_URL=https://seu_projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/           # Autenticação
│   ├── dashboard/      # Componentes do dashboard
│   ├── gamificacao/    # Sistema de XP, conquistas
│   ├── layout/         # Layout da aplicação
│   ├── notifications/  # Centro de notificações
│   ├── scanner/        # Leitor QR Code
│   ├── triagem/        # Componentes de triagem
│   └── ui/             # shadcn/ui components
├── contexts/
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useRecebimentos.ts
│   ├── useTriagens.ts
│   ├── useEstoque.ts
│   ├── useMovimentacoes.ts
│   ├── useDashboard.ts
│   ├── useProdutividade.ts
│   ├── useGamificacao.ts
│   └── ...
├── integrations/
│   └── supabase/
├── pages/
│   ├── Dashboard.tsx
│   ├── Recebimento.tsx
│   ├── Triagem.tsx
│   ├── Estoque.tsx
│   └── ...
└── types/
    └── estoque.ts
```

## 🔐 Autenticação e Roles

O sistema possui 3 níveis de acesso:

| Role | Acesso |
|------|--------|
| **admin** | Todas as funcionalidades + configurações |
| **supervisor** | Dashboard, relatórios, gestão + operações |
| **operador** | Operações: recebimento, triagem, estoque |

## 📊 Modelo de Dados

### Tabelas Principais

- `profiles` - Perfis de usuários
- `user_roles` - Roles (operador, supervisor, admin)
- `recebimentos` - Registro de recebimentos
- `triagens` - Fila e histórico de triagem
- `posicoes_estoque` - Posições físicas (PP, boxes)
- `estoque_posicao` - Relação produto/posição
- `rastreamento_historico` - Log de movimentações
- `trocas_devolucoes` - Workflow de trocas
- `inventario_ciclos` - Inventários programados
- `gamificacao_usuarios` - XP, nível, pontos
- `conquistas_usuarios` - Badges desbloqueadas
- `alertas_historico` - Alertas do sistema

## 🎮 Sistema de Gamificação

### Eventos que geram XP

| Ação | XP Base | Bônus |
|------|---------|-------|
| Triagem concluída | 15 | +10 (rápida), +5 (aprovado) |
| Tarefa concluída | 20 | +15 (urgente), +10 (quantidade ok) |
| Check-in diário | 5 | +5 (streak) |

### Conquistas

- Primeiro Passo (1ª triagem)
- Velocista (triagem < 2min)
- Maratonista (10 triagens/dia)
- Perfeccionista (100% aprovação)
- Série de 7 dias

## 🚢 Deploy

```bash
# Build para produção
npm run build

# Preview local
npm run preview
```

## 📝 Licença

Projeto desenvolvido para **Promo Brindes**.

---

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

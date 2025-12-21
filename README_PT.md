# 📦 ESTOKI - Sistema de Gestão de Estoque

Sistema completo de gestão de warehouse e estoque para Promo Brindes.

[English](README.md) | **Português**

## 🚀 Funcionalidades

- 📥 **Recebimento** - Registro e conferência de mercadorias
- 🔍 **Triagem** - Controle de qualidade com fotos
- 📊 **Dashboard** - KPIs em tempo real
- 📦 **Estoque** - Gestão de posições e movimentações
- 🔄 **Trocas/Devoluções** - Fluxo completo de TD
- 📋 **Inventário Cíclico** - Contagens programadas
- 🏆 **Gamificação** - Engajamento de operadores
- 📱 **PWA** - Funciona offline no mobile

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Testes**: Vitest + Playwright

## 📋 Pré-requisitos

- Node.js 20+
- npm ou bun
- Conta Supabase

## 🏃 Início Rápido

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

## 📁 Estrutura

```
src/
├── components/     # Componentes React
├── hooks/          # Custom hooks
├── pages/          # Páginas/rotas
├── contexts/       # React contexts
├── types/          # TypeScript types
├── utils/          # Utilitários
└── integrations/   # Integrações (Supabase)
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Com cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Componentes](docs/COMPONENTS.md)
- [Database](docs/DATABASE.md)
- [API](docs/API.md)
- [Testes](docs/TESTING.md)

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licença

Proprietário - Promo Brindes © 2025


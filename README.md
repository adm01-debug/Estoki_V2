# 📦 ESTOKI - Sistema de Gestão de Estoque

[![CI](https://github.com/adm01-debug/estoki/actions/workflows/ci.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/ci.yml)
[![Deploy](https://github.com/adm01-debug/estoki/actions/workflows/deploy.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/deploy.yml)

Sistema WMS (Warehouse Management System) completo para gestão de estoque e operações logísticas.

## ✨ Funcionalidades

- 📊 **Dashboard** - Visão geral em tempo real
- 📦 **Gestão de Estoque** - Posições, lotes, movimentações
- 🔍 **Triagem** - Conferência com fotos obrigatórias
- 📥 **Recebimento** - Import de NF-e XML
- 🎮 **Gamificação** - XP, conquistas, desafios diários
- 📱 **PWA** - Funciona offline no celular
- 📊 **KPIs** - Métricas operacionais
- 🔔 **Notificações** - Push e tempo real

## 🚀 Quick Start

```bash
# Clonar
git clone https://github.com/adm01-debug/estoki.git
cd estoki

# Instalar
npm install

# Configurar
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase

# Rodar
npm run dev
```

## 📋 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build produção |
| `npm run test` | Testes unitários |
| `npm run test:e2e` | Testes E2E |
| `npm run lint` | Lint código |

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Testes**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Vercel

## 📁 Estrutura

```
src/
├── components/   # Componentes React
├── hooks/        # Custom hooks
├── pages/        # Páginas/rotas
├── services/     # Serviços API
├── contexts/     # React contexts
├── lib/          # Utilitários
└── types/        # TypeScript types
```

## 📚 Documentação

- [Guia de Desenvolvimento](docs/DEVELOPMENT.md)
- [Guia do Administrador](docs/ADMIN_GUIDE.md)
- [Integrações](docs/INTEGRATIONS.md)
- [Schema do Banco](docs/DATABASE_SCHEMA.md)
- [CI/CD Setup](docs/CI_CD_SETUP.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE)

---

Desenvolvido com ❤️ por ESTOKI

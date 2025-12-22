# 🛠️ Guia de Desenvolvimento - ESTOKI

## Requisitos

- Node.js 18+
- npm ou bun
- Git
- VS Code (recomendado)

## Setup Local

### 1. Clonar Repositório
```bash
git clone https://github.com/adm01-debug/estoki.git
cd estoki
```

### 2. Instalar Dependências
```bash
npm install
# ou
bun install
```

### 3. Configurar Ambiente
```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

### 4. Iniciar Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:5173

## Estrutura do Projeto

```
src/
├── components/     # Componentes React
│   ├── ui/        # Componentes shadcn/ui
│   ├── layout/    # Layout e navegação
│   └── ...        # Componentes de negócio
├── hooks/         # Custom hooks
├── pages/         # Páginas/rotas
├── services/      # Serviços de API
├── contexts/      # React Contexts
├── lib/           # Utilitários
├── types/         # TypeScript types
└── utils/         # Funções auxiliares
```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verifica código com ESLint |
| `npm run test` | Executa testes unitários |
| `npm run test:e2e` | Executa testes E2E |
| `npm run type-check` | Verifica tipos TypeScript |

## Convenções de Código

### Commits
Usamos Conventional Commits:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### Branches
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/*` - Novas features
- `fix/*` - Correções
- `hotfix/*` - Correções urgentes

### Componentes
- PascalCase para nomes
- Um componente por arquivo
- Props tipadas com TypeScript
- Documentar com JSDoc

### Hooks
- Prefixo `use`
- Retornar objeto com valores nomeados
- Incluir loading e error states

## Testes

### Unitários (Vitest)
```bash
npm run test
npm run test:coverage
```

### E2E (Playwright)
```bash
npm run test:e2e
npm run test:e2e:ui
```

## Debugging

### VS Code
Configurações em `.vscode/launch.json`

### React DevTools
Instale a extensão do Chrome

### Network
Use o DevTools > Network

## Deploy

### Preview
```bash
npm run build
npm run preview
```

### Produção
Push para `main` aciona deploy automático via GitHub Actions

## Recursos

- [React Docs](https://react.dev)
- [TypeScript](https://typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---
*Atualizado em Dezembro 2025*

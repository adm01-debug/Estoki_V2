# Contribuindo para ESTOKI

Obrigado por considerar contribuir para o ESTOKI! Este documento fornece diretrizes e informações sobre como contribuir.

## 🚀 Como Começar

1. **Fork o repositório**
2. **Clone seu fork:**
   ```bash
   git clone https://github.com/seu-usuario/estoki.git
   cd estoki
   ```
3. **Instale as dependências:**
   ```bash
   npm install
   ```
4. **Crie uma branch para sua feature:**
   ```bash
   git checkout -b feature/minha-feature
   ```

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
├── contexts/       # Context providers
├── hooks/          # Custom hooks
├── integrations/   # Integrações externas (Supabase)
├── lib/           # Utilitários e helpers
├── pages/         # Páginas da aplicação
└── types/         # TypeScript types
```

## 🎯 Padrões de Código

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Manutenção

Exemplo: `feat(triagem): adicionar timer automático`

### TypeScript
- Use tipos explícitos
- Evite `any`
- Crie interfaces para props de componentes

### Componentes
- Um componente por arquivo
- Use function components com hooks
- Extraia lógica complexa para custom hooks

### Testes
- Crie testes para hooks críticos
- Use Vitest e Testing Library
- Mantenha cobertura acima de 70%

## 🔄 Fluxo de Trabalho

1. Crie uma branch da `main`
2. Faça suas alterações
3. Execute linting: `npm run lint`
4. Execute testes: `npm test`
5. Faça commit das alterações
6. Abra um Pull Request

## 🐛 Reportando Bugs

Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)

## ✨ Sugerindo Features

Abra uma issue com:
- Descrição da feature
- Caso de uso
- Benefícios esperados

## 📝 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

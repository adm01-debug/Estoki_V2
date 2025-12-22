# 🤝 Contribuindo para o ESTOKI

Obrigado por considerar contribuir!

## Como Contribuir

### 1. Fork e Clone
```bash
git clone https://github.com/SEU_USER/estoki.git
cd estoki
npm install
```

### 2. Crie uma Branch
```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-fix
```

### 3. Faça suas Alterações
- Siga os padrões de código
- Adicione testes para novas features
- Atualize a documentação se necessário

### 4. Commit
Usamos Conventional Commits:
```bash
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "fix: corrige bug no dashboard"
git commit -m "docs: atualiza README"
```

Tipos aceitos:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### 5. Push e PR
```bash
git push origin feature/minha-feature
```
Abra um Pull Request no GitHub.

## Padrões de Código

### TypeScript
- Tipar todas as props e funções
- Evitar `any`
- Usar interfaces para objetos complexos

### React
- Componentes funcionais
- Custom hooks para lógica reutilizável
- Props destruturation

### CSS
- Tailwind CSS
- Classes utilitárias
- Evitar CSS customizado

## Testes

```bash
# Unitários
npm run test

# E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## Code Review

Todo PR passa por:
1. Lint automático
2. Testes automatizados
3. Review de código
4. Aprovação de maintainer

## Dúvidas?

Abra uma issue com a label `question`.

---
*Bem-vindo à comunidade ESTOKI!*

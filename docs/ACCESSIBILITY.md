# Guia de Acessibilidade - ESTOKI

## Conformidade

Meta: **WCAG 2.1 Nível AA**

## Princípios POUR

### 1. Perceptível

- ✅ Alt text em todas as imagens
- ✅ Contraste mínimo 4.5:1
- ✅ Não depender apenas de cor
- ✅ Legendas em vídeos

### 2. Operável

- ✅ Navegação por teclado
- ✅ Skip links
- ✅ Focus visível
- ✅ Sem armadilhas de foco

### 3. Compreensível

- ✅ Linguagem clara
- ✅ Labels em formulários
- ✅ Mensagens de erro claras
- ✅ Comportamento previsível

### 4. Robusto

- ✅ HTML semântico
- ✅ ARIA quando necessário
- ✅ Testes com screen readers

## Checklist de Componentes

### Botões

```tsx
// ✅ Correto
<Button aria-label="Fechar modal">
  <X className="h-4 w-4" />
</Button>

// ❌ Incorreto
<Button>
  <X className="h-4 w-4" />
</Button>
```

### Formulários

```tsx
// ✅ Correto
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" aria-describedby="email-error" />
{error && <p id="email-error" role="alert">{error}</p>}
```

### Modais

```tsx
<Dialog>
  <DialogContent
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
  >
    <DialogTitle id="dialog-title">Título</DialogTitle>
  </DialogContent>
</Dialog>
```

### Tabelas

```tsx
<Table>
  <caption className="sr-only">Lista de produtos</caption>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Nome</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

## Testes

### Ferramentas

- axe DevTools
- WAVE
- Lighthouse Accessibility
- VoiceOver (macOS)
- NVDA (Windows)

### Comandos

```bash
# Teste automatizado
npm run test:a11y
```

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| Tab | Navegar elementos |
| Enter/Space | Ativar botão |
| Escape | Fechar modal |
| Arrow Keys | Navegar em listas |

## Recursos

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)


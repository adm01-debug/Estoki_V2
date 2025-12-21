# Guia de Testes - ESTOKI

## Visão Geral

O ESTOKI utiliza **Vitest** como framework de testes, junto com **React Testing Library** para testes de componentes.

## Estrutura de Testes

```
src/
├── hooks/
│   ├── useEstoque.ts
│   └── useEstoque.test.ts    # Teste unitário
├── components/
│   └── __tests__/            # Testes de componentes
└── test/
    └── setup.ts              # Configuração global
```

## Comandos

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:coverage

# Executar testes específicos
npm test -- useEstoque
```

## Tipos de Testes

### 1. Testes Unitários de Hooks

```typescript
import { renderHook, act } from "@testing-library/react";
import { useEstoque } from "./useEstoque";

describe("useEstoque", () => {
  it("deve retornar lista de posições", async () => {
    const { result } = renderHook(() => useEstoque());
    
    await waitFor(() => {
      expect(result.current.posicoes).toBeDefined();
    });
  });
});
```

### 2. Testes de Componentes

```typescript
import { render, screen } from "@testing-library/react";
import { KPICard } from "./KPICard";

describe("KPICard", () => {
  it("deve exibir o título", () => {
    render(<KPICard title="Total" value={100} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
  });
});
```

### 3. Testes E2E (Playwright)

```typescript
test("fluxo de login", async ({ page }) => {
  await page.goto("/auth");
  await page.fill("[name=email]", "test@test.com");
  await page.fill("[name=password]", "password");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL("/");
});
```

## Mocks

### Mock do Supabase

```typescript
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));
```

### Mock do AuthContext

```typescript
const mockAuth = {
  user: { id: "1", email: "test@test.com" },
  loading: false,
};

const wrapper = ({ children }) => (
  <AuthContext.Provider value={mockAuth}>
    {children}
  </AuthContext.Provider>
);
```

## Cobertura

Meta de cobertura: **80%**

| Métrica | Meta | Atual |
|---------|------|-------|
| Statements | 80% | - |
| Branches | 80% | - |
| Functions | 80% | - |
| Lines | 80% | - |

## Boas Práticas

1. **Nomeação**: Use `describe` e `it` descritivos
2. **Isolamento**: Cada teste deve ser independente
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mocks**: Mock apenas o necessário
5. **Async**: Use `waitFor` para operações assíncronas

## CI/CD

Os testes são executados automaticamente no GitHub Actions em cada push e PR.

```yaml
- name: Run tests
  run: npm test -- --coverage
```


import { test, expect } from "@playwright/test";

test.describe("Testes de Carga e Estresse", () => {
  test("simulação de múltiplas requisições ao dashboard", async ({ page }) => {
    const startTime = Date.now();

    // Simula o carregamento agressivo de componentes pesados
    const requests = Array.from({ length: 5 }).map(() => page.goto("/dashboard"));
    await Promise.all(requests);

    const duration = Date.now() - startTime;
    console.log(`Carga simulada: 5 acessos simultâneos em ${duration}ms`);

    // Latência aceitável < 5s para carregamento completo de 5 instâncias pesadas no sandbox
    expect(duration).toBeLessThan(5000);
  });

  test("verificar estabilidade sob erro de rede", async ({ page }) => {
    await page.route("**/functions/v1/**", (route) => route.abort("failed"));
    await page.goto("/dashboard");

    // Deve mostrar estado de erro amigável em vez de quebrar a tela
    await expect(page.locator("text=Erro").or(page.locator(".text-destructive"))).toBeVisible();
  });
});

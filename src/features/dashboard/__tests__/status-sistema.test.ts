import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("status do sistema e permissoes nao mentem ao operador", () => {
  const monitor = () => read("src/features/dashboard/components/SystemHealthMonitor.tsx");

  it("monitor de saude marca indisponivel quando a telemetria falha", () => {
    const fonte = monitor();
    expect(fonte).toContain("isError");
    expect(fonte).toContain('isError ? "Indisponível" : linkOk ? "Operacional" : "Verificando..."');
    expect(fonte).toMatch(/isError \? "bg-destructive"/);
  });

  it("monitor nao exibe marca de outro produto", () => {
    const fonte = monitor();
    expect(fonte).not.toContain("Promo Brindes");
    expect(fonte).toContain("APP_NAME");
  });

  it("guard de permissoes mostra erro com nova tentativa em vez de negar acesso", () => {
    const fonte = read("src/guards/PermissionGuard.tsx");
    expect(fonte).toContain("isError: permissionsError");
    expect(fonte).toContain("refetch: refetchPermissions");
    expect(fonte).toMatch(/if \(permissionsError\) \{[\s\S]{0,200}<ErrorState/);
  });
});

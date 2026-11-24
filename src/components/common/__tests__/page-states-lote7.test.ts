import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ler = (caminho: string) => readFileSync(join(process.cwd(), caminho), "utf8");

describe("estados de tela (erro + nova tentativa) — lote 7", () => {
  it("SecurityOverview não finge conta segura quando a consulta falha", () => {
    const src = ler("src/components/security/SecurityOverview.tsx");
    expect(src).toMatch(/isError: erroDevices/);
    expect(src).toMatch(/isError: erroLoginLogs/);
    expect(src).toMatch(/isError: erroUserRole/);
    expect(src).toMatch(/if \(erroDevices \|\| erroLoginLogs \|\| erroUserRole\) \{/);
    expect(src).toMatch(/onRetry=\{\(\) => \{\n\s*if \(erroDevices\) recarregarDevices\(\);/);
  });

  it("SecurityAlerts não mostra zero alertas quando a consulta falha", () => {
    const src = ler("src/components/security/SecurityAlerts.tsx");
    expect(src).toMatch(/isError: erroLoginLogs/);
    expect(src).toMatch(/if \(erroLoginLogs\) \{/);
    expect(src).toMatch(/onRetry=\{\(\) => recarregarLoginLogs\(\)\}/);
  });

  it("DeviceManagement mostra erro dos dispositivos com nova tentativa", () => {
    const src = ler("src/components/security/DeviceManagement.tsx");
    expect(src).toMatch(/isError,\n\s*error,\n\s*refetch,/);
    expect(src).toMatch(
      /if \(isError\) \{[\s\S]*?<ErrorState[\s\S]*?onRetry=\{\(\) => refetch\(\)\}/
    );
  });

  it("ActiveSessions mostra erro das sessões com nova tentativa", () => {
    const src = ler("src/components/security/ActiveSessions.tsx");
    expect(src).toMatch(/isError,\n\s*error,\n\s*refetch,/);
    expect(src).toMatch(/if \(isError\) \{[\s\S]*?onRetry=\{\(\) => refetch\(\)\}/);
  });

  it("ProdutoDetailDialog mostra erro do histórico em vez de lista vazia", () => {
    const src = ler("src/components/produtos/ProdutoDetailDialog.tsx");
    expect(src).toMatch(/isError: erroHistorico/);
    expect(src).toMatch(/\{erroHistorico \? \(/);
    expect(src).toMatch(/onRetry=\{\(\) => recarregarHistorico\(\)\}/);
  });

  it("PosicaoDetalhePanel mantém os três estados (erro, carregando, vazio)", () => {
    const src = ler("src/components/ocupacao/PosicaoDetalhePanel.tsx");
    expect(src).toMatch(/\{isError \? \(/);
    expect(src).toMatch(/\) : isLoading \? \(/);
    expect(src).toMatch(/\) : !estoqueData\?\.length \? \(/);
    expect(src).toMatch(/onRetry=\{\(\) => refetch\(\)\}/);
  });
});

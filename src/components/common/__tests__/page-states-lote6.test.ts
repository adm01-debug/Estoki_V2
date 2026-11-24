import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ler = (caminho: string) => readFileSync(join(process.cwd(), caminho), "utf8");

describe("estados de tela (erro + nova tentativa) — lote 6", () => {
  it("AdminTelemetria mostra erro no lugar da tabela e permite tentar novamente", () => {
    const src = ler("src/pages/admin/AdminTelemetriaPage.tsx");
    expect(src).toMatch(/import \{ ErrorState \} from "@\/components\/common\/AsyncStates"/);
    expect(src).toMatch(/isError,/);
    expect(src).toMatch(/<ErrorState[\s\S]*?onRetry=\{\(\) => refetch\(\)\}/);
    expect(src).toMatch(/isError \? \(\n\s*<ErrorState[\s\S]*?\) : \(\n\s*<TelemetryTable/);
  });

  it("Etiquetas não mostra lista vazia quando a consulta falha", () => {
    const src = ler("src/pages/Etiquetas.tsx");
    expect(src).toMatch(
      /const erroCarregamento = fonte === "lotes" \? lotesQuery\.isError : entregasQuery\.isError;/
    );
    expect(src).toMatch(/\{erroCarregamento \? \(/);
    expect(src).toMatch(/onRetry=\{recarregarAtual\}/);
  });

  it("Integração de transportadoras sinaliza erro dos romaneios em trânsito", () => {
    const src = ler("src/pages/IntegracaoTransportadoras.tsx");
    expect(src).toMatch(/isError,\n\s*error,\n\s*refetch,/);
    expect(src).toMatch(/\{isError && \(\n\s*<ErrorState/);
  });

  it("Dashboard tempo real sinaliza erro das KPIs e do feed", () => {
    const src = ler("src/features/analytics/pages/RealtimeDashboardPage.tsx");
    expect(src).toMatch(/isError: erroKpis/);
    expect(src).toMatch(/isError: erroFeed/);
    expect(src).toMatch(/\{erroKpis \|\| erroFeed \? \(/);
    expect(src).toMatch(/onRetry=\{\(\) => \{/);
  });

  it("Previsão de demanda não mostra seletor vazio de produtos", () => {
    const src = ler("src/features/analytics/pages/DemandForecastPage.tsx");
    expect(src).toMatch(/isError: erroProdutos/);
    expect(src).toMatch(/\{erroProdutos && \(/);
    expect(src).toMatch(/onRetry=\{\(\) => recarregarProdutos\(\)\}/);
  });
});

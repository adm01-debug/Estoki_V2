import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RelatorioFornecedoresPage from "@/pages/RelatorioFornecedores";
import type { Fornecedor } from "@/hooks/useFornecedores";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const estado = vi.hoisted(() => ({ fornecedores: [] as unknown[] }));

vi.mock("@/hooks/useFornecedores", () => ({
  useFornecedores: () => {
    const fornecedores = estado.fornecedores as Fornecedor[];
    const media = (valores: (number | null)[]) => {
      const medidos = valores.filter((valor): valor is number => valor !== null);
      return medidos.length > 0
        ? Math.round((medidos.reduce((acc, valor) => acc + valor, 0) / medidos.length) * 10) / 10
        : null;
    };
    return {
      fornecedores,
      loading: false,
      error: null,
      refetch: vi.fn(),
      getEstatisticasGerais: () => ({
        total: fornecedores.length,
        classificacaoA: fornecedores.filter((f) => f.classificacao === "A").length,
        classificacaoB: fornecedores.filter((f) => f.classificacao === "B").length,
        classificacaoC: fornecedores.filter((f) => f.classificacao === "C").length,
        classificacaoD: fornecedores.filter((f) => f.classificacao === "D").length,
        pontualidadeMedia: media(fornecedores.map((f) => f.percentual_pontualidade)),
        qualidadeMedia: media(fornecedores.map((f) => f.percentual_qualidade)),
        totalTrocas: fornecedores.reduce((acc, f) => acc + f.trocas_devolucoes, 0),
      }),
      getTopFornecedores: (limite = 5) => fornecedores.slice(0, limite),
      getFornecedoresCriticos: () => fornecedores.filter((f) => f.classificacao === "D"),
    };
  },
}));

const fornecedor = (over: Partial<Fornecedor> & { nome: string }): Fornecedor => ({
  id: over.nome,
  categoria: "Geral",
  entregas_totais: 0,
  entregas_no_prazo: 0,
  entregas_com_previsao: 0,
  percentual_pontualidade: null,
  itens_recebidos: 0,
  itens_aprovados: null,
  triagens: 0,
  percentual_qualidade: null,
  trocas_devolucoes: 0,
  taxa_problemas: null,
  classificacao: null,
  pontuacao: null,
  tendencia: "sem_dados",
  created_at: "",
  updated_at: "",
  ...over,
});

describe("RelatorioFornecedores", () => {
  beforeEach(() => {
    estado.fornecedores = [];
  });

  it("mostra travessão e 'Sem dados' quando o fornecedor não tem medição", () => {
    estado.fornecedores = [
      fornecedor({ nome: "Beta" }),
      fornecedor({
        nome: "Alfa",
        entregas_totais: 4,
        entregas_com_previsao: 4,
        entregas_no_prazo: 4,
        percentual_pontualidade: 100,
        percentual_qualidade: 50,
        triagens: 2,
        itens_recebidos: 20,
        itens_aprovados: 10,
        classificacao: "A",
        pontuacao: 96,
        tendencia: "subindo",
      }),
    ];

    render(<RelatorioFornecedoresPage />);

    expect(screen.getByText("Sem dados")).toBeInTheDocument();
    expect(screen.getAllByText("100.0%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("50.0%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });

  it("não quebra a tela quando nenhum fornecedor tem métrica", () => {
    estado.fornecedores = [fornecedor({ nome: "Beta" })];

    render(<RelatorioFornecedoresPage />);

    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FeatureFlagsPage from "@/pages/admin/FeatureFlagsPage";

const { updateMock, insertMock, deleteMock, reloadMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  insertMock: vi.fn(),
  deleteMock: vi.fn(),
  reloadMock: vi.fn(),
}));

const flags = [
  {
    key: "feature.ai_assistant",
    enabled: false,
    value: null,
    description: "Assistente de IA",
    active: true,
    updated_at: new Date().toISOString(),
    updated_by: null,
  },
  {
    key: "ui.dark_mode",
    enabled: true,
    value: null,
    description: "Tema escuro",
    active: true,
    updated_at: new Date().toISOString(),
    updated_by: null,
  },
  {
    key: "integration.sap",
    enabled: false,
    value: null,
    description: null,
    active: false,
    updated_at: null,
    updated_by: null,
  },
];

const cadeia = () => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.order = vi.fn(() => Promise.resolve({ data: flags, error: null }));
  chain.eq = vi.fn(() => Promise.resolve({ data: null, error: null }));
  chain.update = updateMock.mockImplementation(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  }));
  chain.delete = deleteMock.mockImplementation(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  }));
  chain.insert = insertMock.mockImplementation(() => Promise.resolve({ data: null, error: null }));
  return chain;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => cadeia()) },
}));

vi.mock("@/lib/featureFlags", () => ({
  featureFlags: { reload: reloadMock, setFlag: vi.fn() },
}));

const renderPagina = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <FeatureFlagsPage />
      </QueryClientProvider>
    </HelmetProvider>
  );
};

describe("FeatureFlagsPage", () => {
  beforeEach(() => {
    updateMock.mockClear();
    insertMock.mockClear();
    deleteMock.mockClear();
    reloadMock.mockClear();
  });

  it("lista as funcionalidades com a contagem de ligadas, desligadas e ocultas", async () => {
    renderPagina();

    await waitFor(() => expect(screen.getByText("feature.ai_assistant")).toBeInTheDocument());
    expect(screen.getByText("ui.dark_mode")).toBeInTheDocument();
    expect(screen.getByText("Oculta")).toBeInTheDocument();

    const valor = (rotulo: string) =>
      screen.getAllByText(rotulo)[0].parentElement?.textContent ?? "";
    expect(valor("Total de chaves")).toContain("3");
    expect(valor("Ligadas")).toContain("1");
    expect(valor("Desligadas")).toContain("1");
    expect(valor("Ocultas")).toContain("1");
  });

  it("desliga uma funcionalidade ligada e propaga para o servico de flags", async () => {
    const usuario = userEvent.setup();
    renderPagina();

    await waitFor(() => expect(screen.getByText("ui.dark_mode")).toBeInTheDocument());
    await usuario.click(screen.getByLabelText("Ligar ui.dark_mode"));

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith({ enabled: false }));
  });

  it("nao deixa criar chave fora do formato area.nome", async () => {
    const usuario = userEvent.setup();
    renderPagina();

    await waitFor(() => expect(screen.getByText("feature.ai_assistant")).toBeInTheDocument());
    await usuario.type(screen.getByLabelText("Chave"), "flag@@@");

    expect(screen.getByText(/Use minúsculas, números/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criar/ })).toBeDisabled();
  });
});

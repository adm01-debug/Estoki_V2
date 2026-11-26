import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InventarioConfigTab } from "@/components/inventario/InventarioConfigTab";
import { divergenciaExcedeTolerancia } from "@/hooks/useInventarioConfig";

const { updateMock, insertMock, toastMock, config, permissao } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  insertMock: vi.fn(),
  toastMock: vi.fn(),
  permissao: { admin: true },
  config: {
    id: "cfg-1",
    threshold_divergencia: 2.5,
    meta_acuracidade: 98,
    frequencia_zona_a: 5,
    frequencia_zona_b: 10,
    frequencia_zona_c: 20,
    alerta_posicao_ociosa_dias: 30,
    alerta_vencimento_dias: 45,
    updated_at: new Date().toISOString(),
    updated_by: null,
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1" }, hasRole: () => permissao.admin }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const cadeia = () => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(() => Promise.resolve({ data: config, error: null }));
  chain.update = updateMock.mockImplementation(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  }));
  chain.insert = insertMock.mockImplementation(() => Promise.resolve({ data: null, error: null }));
  return chain;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => cadeia()) },
}));

const renderAba = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <InventarioConfigTab />
    </QueryClientProvider>
  );
};

describe("InventarioConfigTab", () => {
  beforeEach(() => {
    updateMock.mockClear();
    insertMock.mockClear();
    toastMock.mockClear();
    permissao.admin = true;
  });

  it("mostra os valores gravados no banco, nao as constantes do codigo", async () => {
    renderAba();

    await waitFor(() =>
      expect(screen.getByLabelText("Threshold de Divergência (%)")).toHaveValue(2.5)
    );
    expect(screen.getByLabelText("Meta de Acuracidade (%)")).toHaveValue(98);
    expect(screen.getByLabelText("Frequência Curva A (dias)")).toHaveValue(5);
    expect(screen.getByLabelText("Frequência Curva C (dias)")).toHaveValue(20);
  });

  it("grava a tolerancia editada na tabela inventario_config", async () => {
    const usuario = userEvent.setup();
    renderAba();

    const campo = await screen.findByLabelText("Threshold de Divergência (%)");
    await waitFor(() => expect(campo).toHaveValue(2.5));

    await usuario.clear(campo);
    await usuario.type(campo, "7");
    await usuario.click(screen.getByRole("button", { name: /Salvar Configurações/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(updateMock.mock.calls[0][0]).toMatchObject({ threshold_divergencia: 7 });
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Configurações salvas" })
      )
    );
  });

  it("nao deixa quem nao e admin editar", async () => {
    permissao.admin = false;
    renderAba();

    await waitFor(() =>
      expect(
        screen.getByText("Somente administradores podem alterar estas configurações.")
      ).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Threshold de Divergência (%)")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Salvar Configurações/i })).toBeDisabled();
  });
});

describe("divergenciaExcedeTolerancia", () => {
  it("respeita a tolerancia percentual do banco", () => {
    expect(divergenciaExcedeTolerancia(102, 100, 5)).toBe(false);
    expect(divergenciaExcedeTolerancia(106, 100, 5)).toBe(true);
    expect(divergenciaExcedeTolerancia(0, 0, 5)).toBe(false);
    expect(divergenciaExcedeTolerancia(1, 0, 5)).toBe(true);
  });
});

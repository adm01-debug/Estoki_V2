import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SavedFiltersDropdown } from "@/components/filters/SavedFiltersDropdown";

const { useSavedFiltersMock, estado, acoes } = vi.hoisted(() => ({
  useSavedFiltersMock: vi.fn(),
  estado: { filters: [] as any[], isLoading: false },
  acoes: {
    saveFilter: vi.fn(),
    deleteFilter: vi.fn(),
    setDefault: vi.fn(),
    duplicateFilter: vi.fn(),
    incrementUsage: vi.fn(),
  },
}));

vi.mock("@/hooks/useSavedFilters", () => ({
  useSavedFilters: useSavedFiltersMock,
}));

const filtroSalvo = {
  id: "f-1",
  user_id: "u1",
  entity_type: "produtos",
  name: "Estoque baixo",
  filters: { search: "caneta", curva: "A" },
  is_default: false,
  is_shared: false,
  icon: "filter",
  color: "blue",
  usage_count: 3,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("SavedFiltersDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.filters = [];
    estado.isLoading = false;
    useSavedFiltersMock.mockImplementation(() => ({
      filters: estado.filters,
      isLoading: estado.isLoading,
      error: null,
      defaultFilter: estado.filters.find((f) => f.is_default),
      isSaving: false,
      ...acoes,
    }));
  });

  it("mostra estado vazio quando o usuário não tem filtro salvo", async () => {
    render(
      <SavedFiltersDropdown entityType="produtos" currentFilters={{}} onApplyFilter={vi.fn()} />
    );

    await userEvent.click(screen.getByRole("button", { name: /Filtros Salvos/i }));

    expect(await screen.findByText("Nenhum filtro salvo")).toBeInTheDocument();
    expect(useSavedFiltersMock).toHaveBeenCalledWith("produtos");
  });

  it("aplica o filtro salvo e conta o uso ao clicar", async () => {
    estado.filters = [filtroSalvo];
    const onApplyFilter = vi.fn();

    render(
      <SavedFiltersDropdown
        entityType="produtos"
        currentFilters={{ search: "", curva: "todos" }}
        onApplyFilter={onApplyFilter}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Filtros Salvos/i }));
    await userEvent.click(await screen.findByText("Estoque baixo"));

    expect(onApplyFilter).toHaveBeenCalledWith({ search: "caneta", curva: "A" });
    expect(acoes.incrementUsage).toHaveBeenCalledWith("f-1");
  });

  it("salva o filtro atual com o nome digitado", async () => {
    const currentFilters = { search: "papel", status: "todos" };

    render(
      <SavedFiltersDropdown
        entityType="produtos"
        currentFilters={currentFilters}
        onApplyFilter={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Filtros Salvos/i }));
    await userEvent.click(await screen.findByText("Salvar Filtro Atual"));

    await userEvent.type(await screen.findByLabelText(/Nome do Filtro/i), "Meu filtro");
    await userEvent.click(screen.getByRole("button", { name: /^Salvar$/i }));

    await waitFor(() =>
      expect(acoes.saveFilter).toHaveBeenCalledWith({ name: "Meu filtro", filters: currentFilters })
    );
  });

  it("não salva filtro sem nome", async () => {
    render(
      <SavedFiltersDropdown
        entityType="produtos"
        currentFilters={{ search: "x" }}
        onApplyFilter={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Filtros Salvos/i }));
    await userEvent.click(await screen.findByText("Salvar Filtro Atual"));

    const salvar = await screen.findByRole("button", { name: /^Salvar$/i });
    expect(salvar).toBeDisabled();
    await userEvent.click(salvar);
    expect(acoes.saveFilter).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { shippingService } from "./shippingService";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

describe("shippingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch romaneios successfully", async () => {
    const mockData = [{ id: "1", codigo: "ROM-1", status: "rascunho", romaneio_itens: [] }];

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }));

    const result = await shippingService.getRomaneios();
    expect(result).toHaveLength(1);
    expect(result[0].codigo).toBe("ROM-1");
  });

  it("should handle errors when fetching romaneios", async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
    }));

    await expect(shippingService.getRomaneios()).rejects.toThrow("DB Error");
  });

  it("should create a new romaneio", async () => {
    const input = {
      motorista: "João",
      placa_veiculo: "ABC-1234",
      tipo_veiculo: "Caminhão",
    };

    (supabase.from as any).mockImplementation(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "new-id", ...input }, error: null }),
    }));

    const result = await shippingService.criarRomaneio(input as any);
    expect(result.id).toBe("new-id");
    expect(supabase.from).toHaveBeenCalledWith("romaneios");
  });

  it("should persist the delivery and recompute the romaneio progress", async () => {
    const comprovantes = [
      { romaneio_item_id: "item-1", status: "entregue" },
      { romaneio_item_id: "item-2", status: "recusado" },
    ];
    const inserted: any[] = [];
    const updates: any[] = [];
    let chamadas = 0;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "comprovantes_entrega") {
        chamadas += 1;
        const listando = chamadas > 1;
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          order: () => chain,
          limit: () => chain,
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          insert: (payload: any) => {
            inserted.push(payload);
            return Promise.resolve({ error: null });
          },
          then: (resolve: any) => resolve({ data: listando ? comprovantes : null, error: null }),
        };
        return chain;
      }
      return {
        update: (payload: any) => {
          updates.push(payload);
          return { eq: () => Promise.resolve({ error: null }) };
        },
      };
    });

    await shippingService.registrarEntrega("rom-1", "item-1", "entregue");

    expect(inserted[0]).toMatchObject({
      romaneio_id: "rom-1",
      romaneio_item_id: "item-1",
      status: "entregue",
    });
    expect(updates[0]).toEqual({ entregas_realizadas: 1 });
  });

  it("should update the existing delivery proof instead of duplicating it", async () => {
    const inserted: any[] = [];
    const atualizados: any[] = [];

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "comprovantes_entrega") {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          order: () => chain,
          limit: () => chain,
          maybeSingle: () => Promise.resolve({ data: { id: "comp-1" }, error: null }),
          insert: (payload: any) => {
            inserted.push(payload);
            return Promise.resolve({ error: null });
          },
          update: (payload: any) => {
            atualizados.push(payload);
            return {
              eq: (_col: string, valor: string) => {
                atualizados.push({ id: valor });
                return Promise.resolve({ error: null });
              },
            };
          },
          then: (resolve: any) => resolve({ data: [], error: null }),
        };
        return chain;
      }
      return { update: () => ({ eq: () => Promise.resolve({ error: null }) }) };
    });

    await shippingService.registrarEntrega("rom-1", "item-1", "recusado");

    expect(inserted).toHaveLength(0);
    expect(atualizados[0]).toMatchObject({ status: "recusado" });
    expect(atualizados[1]).toEqual({ id: "comp-1" });
  });

  it("should derive the item status and the progress from the delivery proofs", async () => {
    const mockData = [
      {
        id: "rom-1",
        codigo: "ROM-1",
        status: "em_transito",
        total_entregas: 2,
        entregas_realizadas: 0,
        romaneio_itens: [
          { id: "item-1", cliente: "Cliente A" },
          { id: "item-2", cliente: "Cliente B" },
        ],
        comprovantes_entrega: [
          { romaneio_item_id: "item-1", status: "entregue", created_at: "2026-11-23T10:00:00Z" },
          { romaneio_item_id: "item-2", status: "recusado", created_at: "2026-11-23T11:00:00Z" },
        ],
      },
    ];

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }));

    const [romaneio] = await shippingService.getRomaneios();

    expect(romaneio.itens[0].status).toBe("entregue");
    expect(romaneio.itens[1].status).toBe("recusado");
    expect(romaneio.entregas_realizadas).toBe(1);
  });
});

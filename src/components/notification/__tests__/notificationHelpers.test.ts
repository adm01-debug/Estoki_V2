import { describe, expect, it } from "vitest";
import { getTipoSeveridade, mapSeveridade } from "@/components/notification/notificationHelpers";

describe("getTipoSeveridade", () => {
  it("nao trata falta de estoque como sucesso", () => {
    expect(getTipoSeveridade("estoque_minimo")).toBe("critical");
    expect(getTipoSeveridade("estoque_baixo")).toBe("warning");
    expect(getTipoSeveridade("ponto_pedido")).toBe("warning");
    expect(getTipoSeveridade("divergencia_inventario")).toBe("critical");
  });

  it("mantem os tipos antigos e cai em info no desconhecido", () => {
    expect(getTipoSeveridade("chegou_carga")).toBe("warning");
    expect(getTipoSeveridade("qualquer_outro")).toBe("info");
    expect(getTipoSeveridade("")).toBe("info");
  });

  it("mapSeveridade continua traduzindo a severidade do banco", () => {
    expect(mapSeveridade("urgente")).toBe("critical");
    expect(mapSeveridade("critico")).toBe("critical");
    expect(mapSeveridade("aviso")).toBe("warning");
    expect(mapSeveridade("info")).toBe("info");
  });
});

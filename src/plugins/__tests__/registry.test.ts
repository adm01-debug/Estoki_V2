import { describe, it, expect, beforeEach } from "vitest";
import { pluginRegistry } from "../registry";
import { definePlugin, satisfiesMinVersion } from "../sdk";

describe("Plugin SDK", () => {
  beforeEach(() => {
    for (const p of pluginRegistry.list()) {
      // @ts-expect-error acesso interno para teste
      pluginRegistry["plugins"].delete(p.id);
    }
    pluginRegistry.setContextFactory(() => ({
      version: "1.0.0",
      tenantId: null,
      userId: null,
      toast: () => {},
      invoke: async () => ({}) as never,
      query: async () => ({}) as never,
      log: () => {},
    }));
  });

  it("satisfiesMinVersion respeita semver simples", () => {
    expect(satisfiesMinVersion("1.0.0", "1.0.0")).toBe(true);
    expect(satisfiesMinVersion("1.2.3", "1.2.0")).toBe(true);
    expect(satisfiesMinVersion("1.0.0", "1.1.0")).toBe(false);
    expect(satisfiesMinVersion("2.0.0", "1.9.9")).toBe(true);
  });

  it("registra, ativa e desativa plugin", async () => {
    const p = definePlugin({
      id: "x.y",
      name: "T",
      version: "0.1.0",
      minHostVersion: "1.0.0",
    });
    expect(pluginRegistry.register(p).ok).toBe(true);
    expect(pluginRegistry.register(p).ok).toBe(false);
    await pluginRegistry.activate("x.y");
    expect(pluginRegistry.active().length).toBe(1);
    await pluginRegistry.deactivate("x.y");
    expect(pluginRegistry.active().length).toBe(0);
  });

  it("rejeita plugin com host desatualizado", () => {
    const p = definePlugin({
      id: "z.z",
      name: "Z",
      version: "1.0.0",
      minHostVersion: "99.0.0",
    });
    const r = pluginRegistry.register(p);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("host");
  });

  it("dispatch invoca handlers ativos e isola exceções", async () => {
    let hits = 0;
    const good = definePlugin({
      id: "g",
      name: "G",
      version: "1.0.0",
      minHostVersion: "1.0.0",
      on: {
        "lote.recebido": () => {
          hits++;
        },
      },
    });
    const bad = definePlugin({
      id: "b",
      name: "B",
      version: "1.0.0",
      minHostVersion: "1.0.0",
      on: {
        "lote.recebido": () => {
          throw new Error("boom");
        },
      },
    });
    pluginRegistry.register(good);
    pluginRegistry.register(bad);
    await pluginRegistry.activate("g");
    await pluginRegistry.activate("b");
    await pluginRegistry.dispatch({
      type: "lote.recebido",
      payload: { loteId: "L1", produtoId: "P1" },
    });
    expect(hits).toBe(1);
  });
});

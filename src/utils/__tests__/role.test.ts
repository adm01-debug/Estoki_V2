import { describe, it, expect } from "vitest";
import { highestRole } from "../role";

describe("highestRole", () => {
  it("escolhe a role de maior poder entre tenants", () => {
    expect(highestRole(["operador", "admin"])).toBe("admin");
    expect(highestRole(["admin", "supervisor"])).toBe("admin");
    expect(highestRole(["operador", "supervisor"])).toBe("supervisor");
  });

  it("devolve null quando nao ha role", () => {
    expect(highestRole([])).toBeNull();
    expect(highestRole([null, undefined])).toBeNull();
  });

  it("ignora valores desconhecidos", () => {
    expect(highestRole(["root", "operador"])).toBe("operador");
    expect(highestRole(["root"])).toBeNull();
  });

  it("uma unica role", () => {
    expect(highestRole(["supervisor"])).toBe("supervisor");
  });
});

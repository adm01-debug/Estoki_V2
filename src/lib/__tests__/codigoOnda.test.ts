import { describe, expect, it } from "vitest";
import { gerarCodigoOnda } from "../codigoOnda";

describe("gerarCodigoOnda", () => {
  it("segue o formato ON-<6 digitos>-<3 digitos>", () => {
    expect(gerarCodigoOnda(1750000000000, () => 0)).toBe("ON-000000-100");
    expect(gerarCodigoOnda(1750000123456, () => 0.999999)).toBe("ON-123456-999");
  });

  it("muda quando o instante da abertura muda", () => {
    const a = gerarCodigoOnda(1750000000000, () => 0.5);
    const b = gerarCodigoOnda(1750000060000, () => 0.5);
    expect(a).not.toBe(b);
  });
});

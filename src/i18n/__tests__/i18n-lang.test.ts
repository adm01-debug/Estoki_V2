import { afterAll, describe, expect, it } from "vitest";
import i18n from "@/i18n";

describe("idioma do documento", () => {
  afterAll(async () => {
    await i18n.changeLanguage("pt-BR");
  });

  it("atualiza <html lang> quando o idioma muda", async () => {
    await i18n.changeLanguage("en");
    expect(document.documentElement.lang).toBe("en");

    await i18n.changeLanguage("es");
    expect(document.documentElement.lang).toBe("es");

    await i18n.changeLanguage("pt-BR");
    expect(document.documentElement.lang).toBe("pt-BR");
  });
});

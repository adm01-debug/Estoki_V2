import { afterAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import i18n from "@/i18n";
import { supportedLanguages } from "@/i18n";

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

  it("carrega apenas os idiomas suportados, sem en-US duplicado", async () => {
    expect(existsSync(resolve(process.cwd(), "src/i18n/locales/en-US.json"))).toBe(false);
    expect(supportedLanguages.map((l) => l.code)).toEqual(["pt-BR", "en", "es"]);
    expect(i18n.options.supportedLngs).toEqual(expect.arrayContaining(["pt-BR", "en", "es"]));
    expect(i18n.options.supportedLngs).not.toContain("en-US");
    expect(i18n.options.load).toBe("currentOnly");
    expect(Object.keys(i18n.options.resources ?? {})).toEqual(["pt-BR", "en", "es"]);
  });
});

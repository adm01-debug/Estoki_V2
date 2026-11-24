import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

const SITE_COLOR = "#0f172a";

describe("SEO canônico e tema único", () => {
  it("canonical e og:url usam o domínio próprio, nunca o preview do Lovable", () => {
    const seo = read("src/components/common/SEO.tsx");
    expect(seo).not.toContain("lovable.app");
    expect(seo).toContain('FALLBACK_BASE_URL = "https://estoki.app"');
    expect(seo).toContain("VITE_PUBLIC_SITE_URL");
  });

  it("theme-color é única e igual em index.html, manifest e SEO", () => {
    const indexTheme = read("index.html").match(/name="theme-color" content="([^"]+)"/)?.[1];
    const manifest = JSON.parse(read("public/manifest.json"));
    const seoColors = [
      ...read("src/components/common/SEO.tsx").matchAll(/name="theme-color" content="([^"]+)"/g),
    ].map((m) => m[1]);
    expect(indexTheme).toBe(SITE_COLOR);
    expect(manifest.theme_color).toBe(SITE_COLOR);
    expect(seoColors).toEqual([SITE_COLOR]);
  });

  it("telas internas são noindex por padrão", () => {
    const seo = read("src/components/common/SEO.tsx");
    expect(seo).toContain("noIndex = true");
  });

  it("security.txt e openapi.json não apontam para domínio de preview", () => {
    const security = read("public/.well-known/security.txt");
    const openapi = read("public/openapi.json");
    expect(security).not.toContain("lovable.app");
    expect(security).toContain("Canonical: https://estoki.app/.well-known/security.txt");
    expect(openapi).not.toContain("lovable.app");
    expect(openapi).toContain('"url": "https://estoki.app"');
  });
});

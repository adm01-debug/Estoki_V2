import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const read = (file: string) => readFileSync(resolve(ROOT, file), "utf8");

describe("SEO/PWA — manifest único e rotas públicas (E-184)", () => {
  it("não emite dois manifests concorrentes", () => {
    const vite = read("vite.config.ts");
    expect(vite).toContain("manifest: false");
    expect(vite).not.toMatch(/short_name:\s*"WMS"/);

    const html = read("index.html");
    expect(html.match(/rel="manifest"/g) ?? []).toHaveLength(1);
    expect(html).toContain('href="/manifest.json"');

    expect(() => JSON.parse(read("public/manifest.json"))).not.toThrow();
  });

  it("usa a mesma cor de tema no HTML e no manifest", () => {
    const html = read("index.html");
    const manifest = JSON.parse(read("public/manifest.json"));

    const metaTheme = html.match(/name="theme-color" content="([^"]+)"/)?.[1];
    expect(metaTheme).toBeTruthy();
    expect(manifest.theme_color).toBe(metaTheme);
    expect(manifest.background_color).toBe("#0f172a");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
  });

  it("robots.txt bloqueia rotas internas e libera só raiz e login", () => {
    const robots = read("public/robots.txt");
    expect(robots).toContain("Disallow: /");
    expect(robots).toContain("Allow: /$");
    expect(robots).toContain("Allow: /auth");
    expect(robots).toContain("Sitemap: https://estoki.app/sitemap.xml");
  });

  it("sitemap não expõe telas internas", () => {
    const sitemap = read("public/sitemap.xml");

    for (const rota of [
      "/dashboard",
      "/estoque",
      "/triagem",
      "/recebimento",
      "/relatorios",
      "/kpis",
    ]) {
      expect(sitemap).not.toContain(`https://estoki.app${rota}<`);
    }

    expect(sitemap).toContain("https://estoki.app/</loc>");
    expect(sitemap).toContain("https://estoki.app/auth</loc>");
  });

  it("prévia de compartilhamento aponta para domínio próprio", () => {
    const html = read("index.html");
    expect(html).toContain('property="og:image" content="https://estoki.app/icon-512.png"');
    expect(html).toContain('name="twitter:image" content="https://estoki.app/icon-512.png"');
    expect(html).toContain('name="twitter:url" content="https://estoki.app/"');
    expect(html).not.toContain("lovable.app-1775315301281.png");
  });
});

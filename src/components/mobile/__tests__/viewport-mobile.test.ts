import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(tsx?|css)$/.test(entry) && !full.includes(`${sep}__tests__${sep}`)) acc.push(full);
  }
  return acc;
}

/**
 * E-179 — viewport mobile: `vh` conta a area sem a barra do navegador, entao a
 * barra de endereco corta o rodape das telas. `dvh` acompanha o viewport visivel.
 */
describe("viewport mobile (E-179)", () => {
  it("nao usa vh/screen em altura de tela (so dvh)", () => {
    const offenders: string[] = [];
    for (const file of walk(ROOT)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\b(min-h-screen|h-screen|100vh)\b/g)) {
        const line = source.slice(0, match.index ?? 0).split("\n").length;
        offenders.push(`${relative(ROOT, file)}:${line} ${match[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("o breakpoint mobile nao colide com o md do Tailwind (768px)", () => {
    const source = readFileSync(join(ROOT, "hooks", "use-mobile.ts"), "utf8");
    expect(source).toContain("max-width: 767px");
    expect(source).not.toContain("max-width: 768px");
  });

  it("a casca do app usa min-h-dvh e mantem a navegacao mobile montada", () => {
    const source = readFileSync(join(ROOT, "components", "layout", "AppLayout.tsx"), "utf8");
    expect(source).toContain("min-h-dvh");
    expect(source).toMatch(/<MobileNavigation[\s\S]*?\/>/);
  });
});

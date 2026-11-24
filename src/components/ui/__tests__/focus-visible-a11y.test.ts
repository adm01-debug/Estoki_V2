import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.tsx$/.test(entry) && !full.includes(`${sep}__tests__${sep}`)) acc.push(full);
  }
  return acc;
}

/** Indicador de foco visível: variante `focus-visible:` ou `focus:` que muda cor/anel. */
const VISIBLE_FOCUS = /focus-visible:|focus:ring|focus:bg|focus:border|focus:text|focus:underline/;

/**
 * Exceções justificadas — não são alvos de foco do usuário:
 * - `ui/chart.tsx`: `outline-none` em camadas SVG internas do recharts;
 * - `layout/AppLayout.tsx`: recipiente com `tabIndex={-1}` que só recebe foco do skip-link.
 */
const EXCEPTIONS = [
  join("components", "ui", "chart.tsx"),
  join("components", "layout", "AppLayout.tsx"),
];

/**
 * E-176: remover o contorno do foco (`outline-none`) só é aceitável quando existe
 * um substituto visível. Sem isso o usuário de teclado não sabe onde está o foco.
 */
describe("foco visível em quem remove o contorno (E-176)", () => {
  it("toda classe com outline-none tem indicador de foco visível", () => {
    const offenders: string[] = [];
    for (const file of walk(ROOT)) {
      const rel = relative(ROOT, file);
      if (EXCEPTIONS.some((exception) => rel === exception)) continue;
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/"([^"\n]*outline-none[^"\n]*)"/g)) {
        if (VISIBLE_FOCUS.test(match[1])) continue;
        const line = source.slice(0, match.index ?? 0).split("\n").length;
        offenders.push(`${rel}:${line}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

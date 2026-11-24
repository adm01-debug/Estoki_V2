import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
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

/**
 * E-174: todo DialogContent precisa de DialogTitle (senão o Radix não anuncia o
 * diálogo) e de DialogDescription ou `aria-describedby={undefined}` explícito.
 */
describe("diálogos acessíveis", () => {
  const files = walk(ROOT).filter((f) => !f.endsWith(join("ui", "dialog.tsx")));

  it("todo DialogContent tem DialogTitle", () => {
    const offenders = files.filter((f) => {
      const source = readFileSync(f, "utf8");
      return source.includes("<DialogContent") && !source.includes("<DialogTitle");
    });
    expect(offenders).toEqual([]);
  });

  it("todo DialogContent declara descrição ou aria-describedby={undefined}", () => {
    const offenders = files.filter((f) => {
      const source = readFileSync(f, "utf8");
      return (
        source.includes("<DialogContent") &&
        !source.includes("DialogDescription") &&
        !source.includes("aria-describedby")
      );
    });
    expect(offenders).toEqual([]);
  });
});

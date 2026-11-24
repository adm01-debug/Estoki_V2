import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

function sourceFiles(dir = "src"): string[] {
  return readdirSync(resolve(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/__tests__|\.test\./.test(path)) return [];
    return [path];
  });
}

describe("cache e helpers sem duplicata", () => {
  it("existe um único QueryClient no app (o de AppProviders)", () => {
    const owners = sourceFiles()
      .filter((p) => read(p).includes("new QueryClient"))
      .map((p) => p.replace(/\\/g, "/"));
    expect(owners).toEqual(["src/components/common/AppProviders.tsx"]);
  });

  it("módulos duplicados e mortos foram removidos", () => {
    expect(existsSync(resolve(process.cwd(), "src/lib/queryClient.ts"))).toBe(false);
    expect(existsSync(resolve(process.cwd(), "src/lib/webVitals.ts"))).toBe(false);
    expect(existsSync(resolve(process.cwd(), "src/hooks/useHead.ts"))).toBe(false);
  });

  it("nenhum arquivo importa o helper de head removido", () => {
    const users = sourceFiles().filter(
      (p) => /useHead["']/.test(read(p)) || /from ["'][^"']*useHead/.test(read(p))
    );
    expect(users).toEqual([]);
  });
});

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function unlabeledIconButtons(source: string) {
  const problems: number[] = [];
  let cursor = 0;

  while (true) {
    const open = source.indexOf("<Button", cursor);
    if (open === -1) break;
    const close = source.indexOf("</Button>", open);
    if (close === -1) break;

    const block = source.slice(open, close);
    if (/size="icon"/.test(block) && !/aria-label|title=|sr-only/.test(block)) {
      problems.push(source.slice(0, open).split("\n").length);
    }

    cursor = close + "</Button>".length;
  }

  return problems;
}

describe("botões de ícone", () => {
  it('todo <Button size="icon"> tem nome acessível (aria-label, title ou sr-only)', () => {
    const offenders = walk(ROOT)
      .filter((file) => file.endsWith(".tsx") && !file.includes("__tests__"))
      .flatMap((file) =>
        unlabeledIconButtons(readFileSync(file, "utf8")).map(
          (line) => `${relative(ROOT, file).replace(/\\/g, "/")}:${line}`
        )
      );

    expect(offenders, `Botões de ícone sem nome acessível:\n${offenders.join("\n")}`).toEqual([]);
  });
});

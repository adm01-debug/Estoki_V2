import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROOT = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

describe("tabelas semânticas", () => {
  it('TableHead usa scope="col" por padrão', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    expect(screen.getByRole("columnheader", { name: "SKU" })).toHaveAttribute("scope", "col");
  });

  it("todo <th> escrito à mão declara scope", () => {
    const offenders = walk(ROOT)
      .filter((file) => file.endsWith(".tsx") && !file.includes("__tests__"))
      .flatMap((file) =>
        readFileSync(file, "utf8")
          .split("\n")
          .map((line, index) => ({ line, number: index + 1 }))
          .filter(({ line }) => /<th[\s>]/.test(line) && !/scope=/.test(line))
          .map(({ number }) => `${relative(ROOT, file).replace(/\\/g, "/")}:${number}`)
      );

    expect(offenders, `Cabeçalhos sem scope:\n${offenders.join("\n")}`).toEqual([]);
  });
});

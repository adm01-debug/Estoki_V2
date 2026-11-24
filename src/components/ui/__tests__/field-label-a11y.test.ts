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

const CONTROLS = /<(Input|Textarea|Checkbox|Switch|SelectTrigger)\b/g;
const LABEL_TAG = /<(Label|label)\b/g;
const ACCESSIBLE_NAME = /\baria-label\s*=|\baria-labelledby\s*=|\bid\s*=|\{\.\.\./;

/** Fim da tag de abertura, respeitando strings e chaves (atributos com `{...}` contêm `>`). */
function findTagEnd(source: string, start: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (char === quote && source[i - 1] !== "\\") quote = null;
    } else if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") depth++;
    else if (char === "}") depth--;
    else if (char === ">" && depth === 0 && source[i - 1] !== "=") return i;
  }
  return -1;
}

/** Intervalos ocupados por um `<label>` que envolve o próprio controle (associação implícita). */
function labelRanges(source: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const match of source.matchAll(LABEL_TAG)) {
    const start = match.index ?? 0;
    const end = findTagEnd(source, start);
    if (end < 0 || source[end - 1] === "/") continue;
    const closing = source.indexOf(`</${match[1]}>`, end);
    if (closing > 0) ranges.push([start, closing]);
  }
  return ranges;
}

const inFormControl = (source: string, pos: number) =>
  source.lastIndexOf("<FormControl>", pos) > source.lastIndexOf("</FormControl>", pos);

const line = (source: string, pos: number) => source.slice(0, pos).split("\n").length;

/**
 * E-172: todo campo do sistema precisa de nome acessível. O leitor de tela só anuncia
 * o campo se houver `aria-label`/`aria-labelledby`/`id` associado a um `<Label htmlFor>`
 * (ou associação implícita via `<label>` envolvente, ou `<FormControl>` do shadcn, que
 * injeta o `id` sozinho).
 */
describe("rótulo associado em todos os campos (E-172)", () => {
  const files = walk(ROOT);

  it("todo controle de formulário tem nome acessível", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const ranges = labelRanges(source);
      for (const match of source.matchAll(CONTROLS)) {
        const pos = match.index ?? 0;
        const end = findTagEnd(source, pos);
        if (end < 0) continue;
        if (ACCESSIBLE_NAME.test(source.slice(pos, end + 1))) continue;
        if (ranges.some(([start, closing]) => start < pos && pos < closing)) continue;
        if (inFormControl(source, pos)) continue;
        offenders.push(`${file}:${line(source, pos)} <${match[1]}>`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("todo htmlFor estático aponta para um id existente no mesmo arquivo", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const ids = new Set([...source.matchAll(/\bid="([^"{}]+)"/g)].map((m) => m[1]));
      for (const match of source.matchAll(/\bhtmlFor="([^"{}]+)"/g)) {
        if (!ids.has(match[1])) offenders.push(`${file}: htmlFor="${match[1]}" sem id`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("nenhum id estático se repete no mesmo arquivo", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const seen = new Map<string, number>();
      for (const match of source.matchAll(/\bid="([^"{}]+)"/g)) {
        seen.set(match[1], (seen.get(match[1]) ?? 0) + 1);
      }
      for (const [id, count] of seen) {
        if (count > 1) offenders.push(`${file}: id="${id}" aparece ${count}x`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

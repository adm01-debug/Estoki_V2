// Testes Deno: deno test supabase/functions/_shared/tsp_test.ts
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { optimizeRoute, routeLength, nearestNeighbor, twoOpt, locationToPoint, manhattan, Point } from "./tsp.ts";

const grid = (coords: number[][]): Point[] =>
  coords.map(([x, y], i) => ({ id: String(i), x, y }));

Deno.test("routeLength lida com 0/1 ponto", () => {
  assertEquals(routeLength([]), 0);
  assertEquals(routeLength([{ id: "a", x: 0, y: 0 }]), 0);
});

Deno.test("NN visita todos os pontos exatamente uma vez", () => {
  const pts = grid([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]);
  const route = nearestNeighbor(pts);
  assertEquals(route.length, pts.length);
  assertEquals(new Set(route.map((p) => p.id)).size, pts.length);
});

Deno.test("2-opt não piora o comprimento", () => {
  const pts = grid([[0, 0], [10, 0], [10, 10], [0, 10], [5, 5], [3, 7]]);
  const nn = nearestNeighbor(pts);
  const refined = twoOpt(nn);
  assert(routeLength(refined) <= routeLength(nn) + 1e-9);
});

Deno.test("optimizeRoute vence sequência ingênua em cenário adversarial", () => {
  // Ordem ingênua zigue-zagueia; 2-opt encontra rota mais curta.
  const pts = grid([[0, 0], [10, 10], [0, 10], [10, 0], [5, 5]]);
  const naive = routeLength(pts);
  const { length } = optimizeRoute(pts);
  assert(length <= naive, `esperado <= ${naive}, obteve ${length}`);
});

Deno.test("locationToPoint mantém corredores próximos", () => {
  const a = locationToPoint("1", "A-01-05-2");
  const b = locationToPoint("2", "A-01-06-2");
  const c = locationToPoint("3", "A-02-05-2");
  const d = locationToPoint("4", "B-01-05-2");
  assert(manhattan(a, b) < manhattan(a, c));
  assert(manhattan(a, c) < manhattan(a, d));
});

Deno.test("optimizeRoute com 1 ponto retorna trivial", () => {
  const { route, length } = optimizeRoute(grid([[3, 3]]));
  assertEquals(route.length, 1);
  assertEquals(length, 0);
});

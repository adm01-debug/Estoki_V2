// Otimização de rotas de picking — Nearest Neighbor + 2-opt
// Coordenadas 2D/3D com custo Manhattan (padrão para armazém ortogonal).

export interface Point {
  id: string;
  x: number;
  y: number;
  z?: number;
  label?: string;
  payload?: unknown;
}

export type DistanceFn = (a: Point, b: Point) => number;

export const manhattan: DistanceFn = (a, b) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs((a.z ?? 0) - (b.z ?? 0));

export const euclidean: DistanceFn = (a, b) => {
  const dx = a.x - b.x, dy = a.y - b.y, dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export function routeLength(route: Point[], dist: DistanceFn = manhattan): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += dist(route[i - 1], route[i]);
  return total;
}

export function nearestNeighbor(points: Point[], startIndex = 0, dist: DistanceFn = manhattan): Point[] {
  if (points.length <= 1) return [...points];
  const remaining = [...points];
  const route: Point[] = [remaining.splice(startIndex, 1)[0]];
  while (remaining.length) {
    const last = route[route.length - 1];
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = dist(last, remaining[i]);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    route.push(remaining.splice(bestIdx, 1)[0]);
  }
  return route;
}

export function twoOpt(route: Point[], dist: DistanceFn = manhattan, maxIter = 100): Point[] {
  if (route.length < 4) return [...route];
  const best = [...route];
  let improved = true, iter = 0;
  while (improved && iter < maxIter) {
    improved = false; iter++;
    for (let i = 1; i < best.length - 2; i++) {
      for (let k = i + 1; k < best.length - 1; k++) {
        const a = best[i - 1], b = best[i], c = best[k], d = best[k + 1];
        const delta = (dist(a, c) + dist(b, d)) - (dist(a, b) + dist(c, d));
        if (delta < -1e-9) {
          const seg = best.slice(i, k + 1).reverse();
          best.splice(i, seg.length, ...seg);
          improved = true;
        }
      }
    }
  }
  return best;
}

export function optimizeRoute(
  points: Point[],
  opts: { dist?: DistanceFn; seeds?: number; refine?: boolean } = {}
): { route: Point[]; length: number; iterations: number; seeded: number } {
  const dist = opts.dist ?? manhattan;
  const seeds = Math.min(Math.max(opts.seeds ?? 3, 1), points.length || 1);
  const refine = opts.refine ?? true;
  if (points.length <= 1) return { route: [...points], length: 0, iterations: 0, seeded: 0 };

  let best: Point[] = [], bestLen = Infinity;
  for (let s = 0; s < seeds; s++) {
    const startIdx = Math.floor((s * points.length) / seeds);
    const nn = nearestNeighbor(points, startIdx, dist);
    const refined = refine ? twoOpt(nn, dist) : nn;
    const len = routeLength(refined, dist);
    if (len < bestLen) { bestLen = len; best = refined; }
  }
  return { route: best, length: bestLen, iterations: seeds, seeded: seeds };
}

/**
 * Converte "ZONA-CORREDOR-POSICAO-NIVEL" (ex.: A-01-05-2) em coordenadas.
 * x = zona*1000 + corredor*10 (custo alto para trocar de corredor)
 * y = posição (percorrer o corredor é barato)
 * z = nível*5 (subir/descer é caro)
 */
export function locationToPoint(id: string, label: string): Point {
  const clean = (label ?? id).toString().toUpperCase().trim();
  const parts = clean.split(/[-_\/\s]+/).filter(Boolean);
  let zone = 0, aisle = 0, pos = 0, level = 0;
  if (parts.length >= 1) zone = charSum(parts[0]);
  if (parts.length >= 2) aisle = parseInt(parts[1], 10) || charSum(parts[1]);
  if (parts.length >= 3) pos = parseInt(parts[2], 10) || charSum(parts[2]);
  if (parts.length >= 4) level = parseInt(parts[3], 10) || 0;
  return { id, label: clean, x: zone * 1000 + aisle * 10, y: pos, z: level * 5 };
}

function charSum(s: string): number {
  let sum = 0;
  for (const ch of s) sum += ch.charCodeAt(0);
  return sum;
}

export type MetodoAmostragem = "raiz_quadrada" | "aql_normal" | "aql_rigoroso" | "aql_reduzido";

// Tabela AQL simplificada (baseada em MIL-STD-105E / ISO 2859-1)
// Nível de inspeção II, AQL 2.5%
export const tabelaAQL: Record<string, { letra: string; normal: number; rigoroso: number; reduzido: number }> = {
  "2-8": { letra: "A", normal: 2, rigoroso: 3, reduzido: 2 },
  "9-15": { letra: "B", normal: 3, rigoroso: 5, reduzido: 2 },
  "16-25": { letra: "C", normal: 5, rigoroso: 8, reduzido: 2 },
  "26-50": { letra: "D", normal: 8, rigoroso: 13, reduzido: 3 },
  "51-90": { letra: "E", normal: 13, rigoroso: 20, reduzido: 5 },
  "91-150": { letra: "F", normal: 20, rigoroso: 32, reduzido: 8 },
  "151-280": { letra: "G", normal: 32, rigoroso: 50, reduzido: 13 },
  "281-500": { letra: "H", normal: 50, rigoroso: 80, reduzido: 20 },
  "501-1200": { letra: "J", normal: 80, rigoroso: 125, reduzido: 32 },
  "1201-3200": { letra: "K", normal: 125, rigoroso: 200, reduzido: 50 },
  "3201-10000": { letra: "L", normal: 200, rigoroso: 315, reduzido: 80 },
  "10001-35000": { letra: "M", normal: 315, rigoroso: 500, reduzido: 125 },
  "35001-150000": { letra: "N", normal: 500, rigoroso: 800, reduzido: 200 },
  "150001-500000": { letra: "P", normal: 800, rigoroso: 1250, reduzido: 315 },
};

// Critérios de aceite/rejeite por tamanho de amostra (AQL 2.5%)
export const criteriosAceite: Record<number, { aceite: number; rejeite: number }> = {
  2: { aceite: 0, rejeite: 1 },
  3: { aceite: 0, rejeite: 1 },
  5: { aceite: 0, rejeite: 1 },
  8: { aceite: 0, rejeite: 1 },
  13: { aceite: 1, rejeite: 2 },
  20: { aceite: 1, rejeite: 2 },
  32: { aceite: 2, rejeite: 3 },
  50: { aceite: 3, rejeite: 4 },
  80: { aceite: 5, rejeite: 6 },
  125: { aceite: 7, rejeite: 8 },
  200: { aceite: 10, rejeite: 11 },
  315: { aceite: 14, rejeite: 15 },
  500: { aceite: 21, rejeite: 22 },
  800: { aceite: 21, rejeite: 22 },
  1250: { aceite: 21, rejeite: 22 },
};

export function getFaixaLote(tamanhoLote: number): string {
  if (tamanhoLote <= 8) return "2-8";
  if (tamanhoLote <= 15) return "9-15";
  if (tamanhoLote <= 25) return "16-25";
  if (tamanhoLote <= 50) return "26-50";
  if (tamanhoLote <= 90) return "51-90";
  if (tamanhoLote <= 150) return "91-150";
  if (tamanhoLote <= 280) return "151-280";
  if (tamanhoLote <= 500) return "281-500";
  if (tamanhoLote <= 1200) return "501-1200";
  if (tamanhoLote <= 3200) return "1201-3200";
  if (tamanhoLote <= 10000) return "3201-10000";
  if (tamanhoLote <= 35000) return "10001-35000";
  if (tamanhoLote <= 150000) return "35001-150000";
  return "150001-500000";
}

export function calcularAmostraRaizQuadrada(tamanhoLote: number): number {
  const raiz = Math.ceil(Math.sqrt(tamanhoLote));
  const minimo = Math.min(5, tamanhoLote);
  const maximo = Math.ceil(tamanhoLote * 0.1);
  return Math.max(minimo, Math.min(raiz, maximo));
}

export function calcularAmostraAQL(tamanhoLote: number, tipo: "normal" | "rigoroso" | "reduzido"): number {
  const faixa = getFaixaLote(tamanhoLote);
  const dados = tabelaAQL[faixa];
  if (!dados) return calcularAmostraRaizQuadrada(tamanhoLote);
  return dados[tipo];
}

export function getCriteriosAceite(tamanhoAmostra: number): { aceite: number; rejeite: number } {
  const tamanhos = Object.keys(criteriosAceite).map(Number).sort((a, b) => a - b);
  const tamanhoProximo = tamanhos.reduce((prev, curr) => 
    Math.abs(curr - tamanhoAmostra) < Math.abs(prev - tamanhoAmostra) ? curr : prev
  );
  return criteriosAceite[tamanhoProximo] || { aceite: 0, rejeite: 1 };
}

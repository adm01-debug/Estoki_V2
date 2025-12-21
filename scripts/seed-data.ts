/**
 * Script para popular dados de teste
 * Execute com: npx ts-node scripts/seed-data.ts
 */

const corredores = ["A", "B", "C", "D"];
const niveis = ["1", "2", "3", "4"];
const tipos = ["picking", "pulmao", "blocado"];

const posicoes = [];
for (const corredor of corredores) {
  for (let prateleira = 1; prateleira <= 10; prateleira++) {
    for (const nivel of niveis) {
      posicoes.push({
        codigo: `${corredor}${String(prateleira).padStart(2, "0")}-${nivel}`,
        corredor,
        prateleira: String(prateleira),
        nivel,
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        status: Math.random() > 0.3 ? "ocupada" : "livre",
        capacidade_max: 100,
        ocupacao_atual: Math.floor(Math.random() * 100),
      });
    }
  }
}

console.log(`Generated ${posicoes.length} positions`);
console.log(JSON.stringify(posicoes.slice(0, 3), null, 2));

export { posicoes };
